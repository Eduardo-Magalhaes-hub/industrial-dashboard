/**
 * Simulador de tempo real do misturador.
 * Gera um novo ponto de dados a cada 3s e cria alertas automáticos.
 */
import { v4 as uuid } from "uuid";
import { getDatabase } from "../database/schema";
import type { MachineState } from "@industrial/types";

let currentState: MachineState = "RUNNING";
let temperature = 72;
let rpm = 1200;
let uptimeSeconds = 0;
let simulatorInterval: NodeJS.Timeout | null = null;

const THRESHOLDS = { tempWarning: 80, tempCritical: 88, rpmMin: 900 };

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

  const targetTemp = currentState === "RUNNING" ? 72 : 50;
  temperature = temperature + (targetTemp - temperature) * 0.03 + wobble(0, 1.2);
  temperature = Math.max(35, Math.min(98, temperature));

  rpm = currentState === "RUNNING" ? wobble(1200, 90) : 0;
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

function checkAndCreateAlerts(timestamp: string): void {
  const db = getDatabase();
  const alert = (level: string, message: string, component: string) =>
    db.prepare(`INSERT INTO alerts (id, level, message, component, timestamp, acknowledged) VALUES (?, ?, ?, ?, ?, 0)`)
      .run(uuid(), level, message, component, timestamp);

  if (temperature >= THRESHOLDS.tempCritical)
    alert("CRITICAL", `Temperatura crítica: ${temperature.toFixed(1)}°C`, "Sensor T-01");
  else if (temperature >= THRESHOLDS.tempWarning)
    alert("WARNING", `Temperatura elevada: ${temperature.toFixed(1)}°C`, "Sensor T-01");

  if (currentState === "RUNNING" && rpm < THRESHOLDS.rpmMin)
    alert("WARNING", `RPM abaixo do mínimo: ${rpm.toFixed(0)} RPM`, "Motor M-01");

  if (currentState === "ERROR")
    alert("CRITICAL", "Máquina entrou em estado de ERRO.", "Sistema de Controle");
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
