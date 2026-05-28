import { Router, type Router as ExpressRouter } from "express";
import { getDatabase } from "../database/schema";
import { getLatestStatus } from "../services/simulator";

const router: ExpressRouter = Router();

router.get("/latest", (_req, res) => {
  const row = getLatestStatus() as any;
  if (!row) return res.status(404).json({ success: false, data: null, timestamp: new Date().toISOString() });

  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: {
      id: row.id,
      timestamp: row.timestamp,
      state: row.state,
      metrics: { temperature: row.temperature, rpm: row.rpm, uptime: row.uptime, efficiency: row.efficiency },
      oee: { overall: row.oee_overall, availability: row.oee_availability, performance: row.oee_performance, quality: row.oee_quality },
    },
  });
});

router.get("/history", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 60, 500);

  const rows = getDatabase().prepare(`
    SELECT timestamp, temperature, rpm, efficiency
    FROM machine_status ORDER BY timestamp DESC LIMIT ?
  `).all(limit) as any[];

  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: rows.reverse(),
  });
});

export default router;
