/**
 * Servidor Express — API REST do Dashboard Industrial
 *
 * Endpoints:
 *  GET  /api/status/latest      — estado atual da máquina
 *  GET  /api/status/history     — histórico para gráficos
 *  GET  /api/alerts             — lista de alertas
 *  PATCH /api/alerts/:id/acknowledge — reconhecer alerta
 *  GET  /api/health             — health check
 */
import express from "express";
import cors from "cors";
import { getDatabase } from "./database/schema";
import statusRouter from "./routes/status";
import alertsRouter from "./routes/alerts";
import { errorHandler } from "./middleware/errorHandler";
import { startSimulator } from "./services/simulator";

const app = express();
const PORT = process.env.PORT || 3001;

// ---- Middlewares globais ----
app.use(cors({ origin: "http://localhost:3000" })); // permite apenas o frontend local
app.use(express.json());

// ---- Rotas ----
app.use("/api/status", statusRouter);
app.use("/api/alerts", alertsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ---- Tratamento de erro global ----
app.use(errorHandler);

// ---- Inicialização ----
async function bootstrap() {
  // Garante que as tabelas existem antes de qualquer coisa
  getDatabase();
  console.log("✅ Banco de dados conectado");

  // Inicia o simulador de dados em tempo real
  startSimulator();

  app.listen(PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

bootstrap();
