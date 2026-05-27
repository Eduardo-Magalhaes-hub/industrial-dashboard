import { Request, Response, NextFunction } from "express";

/** Middleware global de tratamento de erros */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error("[API Error]", err.message);
  res.status(500).json({
    success: false,
    data: null,
    error: process.env.NODE_ENV === "development" ? err.message : "Erro interno do servidor",
    timestamp: new Date().toISOString(),
  });
}
