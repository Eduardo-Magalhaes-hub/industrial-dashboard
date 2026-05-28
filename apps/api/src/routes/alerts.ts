import { Router, type Router as ExpressRouter } from "express";
import { v4 as uuid } from "uuid";
import { getDatabase } from "../database/schema";

const router: ExpressRouter = Router();

router.get("/", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const rows = getDatabase().prepare(`
    SELECT * FROM alerts
    ORDER BY CASE level WHEN 'CRITICAL' THEN 0 WHEN 'WARNING' THEN 1 ELSE 2 END, timestamp DESC
    LIMIT ?
  `).all(limit) as any[];

  return res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: rows.map((r) => ({ ...r, acknowledged: r.acknowledged === 1 })),
  });
});

router.patch("/:id/acknowledge", (req, res) => {
  const result = getDatabase().prepare("UPDATE alerts SET acknowledged = 1 WHERE id = ?").run(req.params.id);
  if ((result as any).changes === 0) return res.status(404).json({ success: false, data: null, timestamp: new Date().toISOString() });
  return res.json({ success: true, data: { id: req.params.id, acknowledged: true }, timestamp: new Date().toISOString() });
});

router.post("/", (req, res) => {
  const { level, message, component } = req.body;
  if (!level || !message || !component) return res.status(400).json({ success: false, data: null, timestamp: new Date().toISOString() });

  const id = uuid();
  getDatabase().prepare("INSERT INTO alerts (id, level, message, component, timestamp, acknowledged) VALUES (?, ?, ?, ?, ?, 0)")
    .run(id, level, message, component, new Date().toISOString());
  return res.status(201).json({ success: true, data: { id }, timestamp: new Date().toISOString() });
});

export default router;
