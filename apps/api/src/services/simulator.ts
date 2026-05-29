/**
 * Simulador de tempo real do misturador.
 * Gera um novo ponto de dados a cada 3s e cria alertas automáticos
 * com deduplicação por componente (suppression window).
 */
import { v4 as uuid } from "uuid";
import { getDatabase } from "../database/schema";
import { DEFAULT_THRESHOLDS, type MachineState } from "@industrial/types";

let currentState: MachineState = "RUNNING";
let temperature = 72;
let rpm = 1200;
let uptimeSeconds = 0;
let simulatorInterval: NodeJS.Timeout | null = null;

// Limites vêm da fonte única de verdade em @industrial/types,
// garantindo que simulador e frontend usem exatamente os mesmos valores.
const TEMP = DEFAULT_THRESHOLDS.temperature;
const RPM = DEFAULT_THRESHOLDS.rpm;

// Janela de supressão: não recria o mesmo alerta para o mesmo componente
// dentro deste intervalo (em ms). Evita spam quando a condição persiste por
// vários ticks consecutivos — padrão usado em sistemas de monitoramento reais.
const ALERT_SUPPRESSION_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

function wobble(base: number, amplitude: number): number {
  return base + (Math.random() - 0.5) * 2 * amplitude;
}

export function simulateTick(): void {
  const db = getDatabase();
  const rand = Math.random();

  // Transições de estado probabilísticas
  if (currentState === "RUNNING") {
    if (rand < 0.002) currentState = "ERROR";
    else if (rand < 0.005) currentState = "MAINTENANCE";
  } else {
    if (rand < 0.08) currentState = "RUNNING";
  }

  // Temperatura tende ao alvo (72°C em operação, 50°C parada) com ruído.
  // Clamp em [35, 88]: o teto de 88 fica acima do crítico (82) para que
  // o simulador eventualmente dispare alertas críticos de forma realista.
  const targetTemp = currentState === "RUNNING" ? 72 : 50;
  temperature = temperature + (targetTemp - temperature) * 0.03 + wobble(0, 1.2);
  temperature = Math.max(35, Math.min(88, temperature));

  rpm = currentState === "RUNNING" ? wobble(RPM.nominal, 90) : 0;
  rpm = Math.max(0, rpm);

  if (currentState === "RUNNING") uptimeSeconds += 3;

  const efficiency = currentState === "RUNNING" ? wobble(89, 6) : 0;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO machine_status
      (id, timestamp, state, temperature, rpm, uptime, efficiency,
       oee_overall, oee_availability, oee_performance, oee_quality)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuid(), now, currentState,
    +temperature.toFixed(1), +rpm.toFixed(0), uptimeSeconds,
    +efficiency.toFixed(1), +(efficiency * 0.95).toFixed(1),
    +(wobble(97, 2)).toFixed(1), +(wobble(94, 3)).toFixed(1), +(wobble(93, 2)).toFixed(1)
  );

  checkAndCreateAlerts(now);
}

/**
 * Verifica se já existe alerta recente não-reconhecido para o mesmo componente.
 * Retorna true se um novo alerta DEVE ser criado (não existe duplicata recente).
 */
function shouldCreateAlert(component: string, level: string): boolean {
  const cutoff = new Date(Date.now() - ALERT_SUPPRESSION_WINDOW_MS).toISOString();

  // Procura alerta do mesmo componente + nível dentro da janela de supressão
  const existing = getDatabase().prepare(`
    SELECT id FROM alerts
    WHERE component = ? AND level = ? AND timestamp >= ?
    ORDER BY timestamp DESC LIMIT 1
  `).get(component, level, cutoff);

  return !existing;
}

function checkAndCreateAlerts(timestamp: string): void {
  const db = getDatabase();

  // Função interna: cria alerta somente se passar pelo filtro de deduplicação
  const tryCreateAlert = (level: string, message: string, component: string) => {
    if (!shouldCreateAlert(component, level)) return;
    db.prepare(
      `INSERT INTO alerts (id, level, message, component, timestamp, acknowledged)
       VALUES (?, ?, ?, ?, ?, 0)`
    ).run(uuid(), level, message, component, timestamp);
  };

  // Limiares de temperatura vindos da fonte única de verdade
  if (temperature >= TEMP.critical)
    tryCreateAlert("CRITICAL", `Temperatura crítica: ${temperature.toFixed(1)}°C`, "Sensor T-01");
  else if (temperature >= TEMP.warning)
    tryCreateAlert("WARNING", `Temperatura elevada: ${temperature.toFixed(1)}°C`, "Sensor T-01");

  if (currentState === "RUNNING" && rpm < RPM.min)
    tryCreateAlert("WARNING", `RPM abaixo do mínimo: ${rpm.toFixed(0)} RPM`, "Motor M-01");

  if (currentState === "ERROR")
    tryCreateAlert("CRITICAL", "Máquina entrou em estado de ERRO.", "Sistema de Controle");
}

export function getLatestStatus() {
  return getDatabase().prepare(
    "SELECT * FROM machine_status ORDER BY timestamp DESC LIMIT 1"
  ).get();
}

export function startSimulator(): void {
  if (simulatorInterval) return;
  console.log("🔄 Simulador iniciado — atualizando a cada 3 segundos");
  simulateTick();
  simulatorInterval = setInterval(simulateTick, 3000);
}

export function stopSimulator(): void {
  if (simulatorInterval) { clearInterval(simulatorInterval); simulatorInterval = null; }
}