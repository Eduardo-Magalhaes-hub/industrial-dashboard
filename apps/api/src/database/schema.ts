/**
 * Camada de banco de dados usando node:sqlite (nativo do Node.js 22+).
 * Não requer instalação de dependências extras ou compilação de C++.
 */

// node:sqlite foi adicionado no Node.js 22.5 como módulo experimental
// No Node 24 ele já é estável e funciona sem flags adicionais.
import { DatabaseSync } from "node:sqlite";
import path from "path";

const DB_PATH = path.join(__dirname, "../../industrial.db");

let db: DatabaseSync;

/**
 * Retorna (ou cria) a instância singleton do banco.
 * Cria as tabelas na primeira execução.
 */
export function getDatabase(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    createTables(db);
  }
  return db;
}

function createTables(db: DatabaseSync): void {
  db.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS machine_status (
      id               TEXT PRIMARY KEY,
      timestamp        TEXT NOT NULL,
      state            TEXT NOT NULL,
      temperature      REAL NOT NULL,
      rpm              REAL NOT NULL,
      uptime           INTEGER NOT NULL,
      efficiency       REAL NOT NULL,
      oee_overall      REAL NOT NULL,
      oee_availability REAL NOT NULL,
      oee_performance  REAL NOT NULL,
      oee_quality      REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id           TEXT PRIMARY KEY,
      level        TEXT NOT NULL,
      message      TEXT NOT NULL,
      component    TEXT NOT NULL,
      timestamp    TEXT NOT NULL,
      acknowledged INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_status_timestamp ON machine_status(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_alerts_level     ON alerts(level);
  `);
}
