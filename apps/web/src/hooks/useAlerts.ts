"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Alert } from "@industrial/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const POLL_INTERVAL = 5000;

interface UseAlertsReturn {
  alerts: Alert[];
  acknowledgeAlert: (id: string) => Promise<void>;
  isLoading: boolean;
}

export function useAlerts(): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Ref para tocar som em alertas críticos novos (não recalcula no render)
  const prevCriticalCount = useRef(0);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts?limit=20`, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();

      const data: Alert[] = json.data.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      }));

      // Feedback sonoro para alertas críticos novos (acessibilidade)
      const criticalCount = data.filter((a) => a.level === "CRITICAL" && !a.acknowledged).length;
      if (criticalCount > prevCriticalCount.current && typeof window !== "undefined") {
        // Beep simples via Web Audio API (sem dependência externa)
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.4);
        } catch {
          // AudioContext pode ser bloqueado antes de interação do usuário — ignora
        }
      }
      prevCriticalCount.current = criticalCount;

      setAlerts(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (id: string) => {
    await fetch(`${API_URL}/api/alerts/${id}/acknowledge`, { method: "PATCH" });
    // Atualização otimista: marca localmente antes de re-buscar
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return { alerts, acknowledgeAlert, isLoading };
}
