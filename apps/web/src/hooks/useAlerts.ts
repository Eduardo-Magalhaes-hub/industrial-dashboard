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

  // Set com IDs de alertas críticos já vistos. Comparar conjuntos é mais
  // confiável que contar: detecta novos alertas mesmo se o operador
  // reconhecer outros entre uma leitura e outra (caso que a contagem perdia).
  const seenCriticalIdsRef = useRef<Set<string>>(new Set());
  // Marca a primeira leitura para não tocar som ao montar (alertas históricos
  // do seed não devem disparar beep).
  const isFirstLoadRef = useRef<boolean>(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/alerts?limit=20`, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();

      const data: Alert[] = json.data.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      }));

      // Conjunto atual de IDs de críticos não-reconhecidos
      const currentCriticalIds = new Set(
        data.filter((a) => a.level === "CRITICAL" && !a.acknowledged).map((a) => a.id)
      );

      // Detecta IDs que não estavam no conjunto da leitura anterior.
      // Esses sim são alertas críticos novos que merecem feedback sonoro.
      if (!isFirstLoadRef.current) {
        const newCriticalIds = [...currentCriticalIds].filter(
          (id) => !seenCriticalIdsRef.current.has(id)
        );
        if (newCriticalIds.length > 0) {
          playAlertBeep();
        }
      }

      // Atualiza o conjunto de IDs vistos para a próxima comparação
      seenCriticalIdsRef.current = currentCriticalIds;
      isFirstLoadRef.current = false;

      setAlerts(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acknowledgeAlert = useCallback(async (id: string) => {
    await fetch(`${API_URL}/api/alerts/${id}/acknowledge`, { method: "PATCH" });
    // Atualização otimista: marca localmente antes de re-buscar
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
    // Remove do conjunto de "vistos" também — assim se o mesmo alerta
    // reaparecer como não-reconhecido futuramente (edge case), ainda toca.
    seenCriticalIdsRef.current.delete(id);
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  return { alerts, acknowledgeAlert, isLoading };
}

/**
 * Beep curto via Web Audio API.
 * Não usa arquivo externo para evitar dependência de assets em /public.
 * Pode falhar silenciosamente se o navegador bloquear AudioContext
 * antes de qualquer interação do usuário (política de autoplay).
 */
function playAlertBeep(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880; // Hz — nota A5, audível mas não estridente
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // AudioContext pode ser bloqueado antes de interação do usuário — ignora
  }
}