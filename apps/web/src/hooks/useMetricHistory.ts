"use client";

import { useState, useEffect, useCallback } from "react";
import type { MetricHistory } from "@industrial/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const POLL_INTERVAL = 5000;
// 100 pontos × 3s = ~5 minutos de histórico exibido no gráfico
const HISTORY_LIMIT = 100;

interface UseMetricHistoryReturn {
  history: MetricHistory[];
}

export function useMetricHistory(): UseMetricHistoryReturn {
  const [history, setHistory] = useState<MetricHistory[]>([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/status/history?limit=${HISTORY_LIMIT}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();

      const data: MetricHistory[] = json.data.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }));
      setHistory(data);
    } catch {
      // Mantém histórico anterior em caso de falha de rede
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  return { history };
}
