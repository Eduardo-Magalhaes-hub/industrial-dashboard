/**
 * Seed: popula o banco com 2h de histórico realista de um misturador.
 * Execute: pnpm --filter @industrial/api seed
 */
import { getDatabase } from "./schema";
import { v4 as uuid } from "uuid";

const db = getDatabase();

db.exec("DELETE FROM machine_status; DELETE FROM alerts;");

const NOMINAL_TEMP = 72;
const NOMINAL_RPM = 1200;
const TOTAL_POINTS = 1440; // 2h × (3600/5s)
const INTERVAL_MS = 5000;

function wobble(base: number, amplitude: number): number {
  return base + (Math.random() - 0.5) * 2 * amplitude;
}

// node:sqlite usa prepare() com run() igual ao better-sqlite3
const insertStatus = db.prepare(`
  INSERT INTO machine_status
    (id, timestamp, state, temperature, rpm, uptime,
     efficiency, oee_overall, oee_availability, oee_performance, oee_quality)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertAlert = db.prepare(`
  INSERT INTO alerts (id, level, message, component, timestamp, acknowledged)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const now = Date.now();
let temperature = NOMINAL_TEMP;
let rpm = NOMINAL_RPM;

for (let i = TOTAL_POINTS; i >= 0; i--) {
  const ts = new Date(now - i * INTERVAL_MS);

  // Simula parada para manutenção entre 90-120min atrás
  const state = i >= 1080 && i <= 1440 ? "RUNNING"
    : i >= 900 && i <= 1080 ? "MAINTENANCE"
    : "RUNNING";

  const targetTemp = state === "MAINTENANCE" ? 45 : NOMINAL_TEMP;
  temperature = temperature + (targetTemp - temperature) * 0.05 + wobble(0, 1.5);
  temperature = Math.max(40, Math.min(95, temperature));

  rpm = state === "MAINTENANCE" ? 0 : wobble(NOMINAL_RPM, 80);

  const uptime = (TOTAL_POINTS - i) * (INTERVAL_MS / 1000);
  const efficiency = state === "RUNNING" ? wobble(88, 5) : 0;

  insertStatus.run(
    uuid(), ts.toISOString(), state,
    +temperature.toFixed(1), +rpm.toFixed(0), uptime,
    +efficiency.toFixed(1), +(efficiency * 0.95).toFixed(1),
    +(wobble(97, 2)).toFixed(1), +(wobble(94, 3)).toFixed(1), +(wobble(93, 2)).toFixed(1)
  );
}

// Alertas históricos
const alertsSeed = [
  { level: "CRITICAL", message: "Temperatura acima do limite crítico (>88°C)", component: "Sensor Temp. T-01", minutesAgo: 15, acknowledged: 1 },
  { level: "WARNING",  message: "RPM abaixo do mínimo operacional (<900 RPM)", component: "Motor Principal M-01", minutesAgo: 32, acknowledged: 1 },
  { level: "INFO",     message: "Manutenção preventiva agendada para amanhã", component: "Sistema", minutesAgo: 60, acknowledged: 0 },
  { level: "WARNING",  message: "Eficiência abaixo de 80% por mais de 5 minutos", component: "Linha de Produção", minutesAgo: 95, acknowledged: 1 },
  { level: "INFO",     message: "Ciclo de limpeza concluído com sucesso", component: "Sistema de Limpeza", minutesAgo: 110, acknowledged: 1 },
];

for (const a of alertsSeed) {
  insertAlert.run(
    uuid(), a.level, a.message, a.component,
    new Date(now - a.minutesAgo * 60 * 1000).toISOString(),
    a.acknowledged
  );
}

console.log(`✅ Seed concluído: ${TOTAL_POINTS} registros de status + ${alertsSeed.length} alertas.`);
