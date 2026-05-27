/**
 * Hook principal: busca o status atual da máquina a cada 3 segundos.
 *
 * Estratégia de polling:
 * - Usa setInterval para simular "tempo real" sem WebSocket
 * - Detecta falha de rede e expõe isConnected para o Header
 * - Evita atualização de estado em componente desmontado (cleanup)
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import type { MachineStatus } from "@industrial/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const POLL_INTERVAL = 3000; // ms

interface UseMachineStatusReturn {
  status: MachineStatus | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useMachineStatus(): UseMachineStatusReturn {
  const [status, setStatus] = useState<MachineStatus | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/status/latest`, {
        // cache: "no-store" garante sempre dado fresco (sem cache do browser)
        cache: "no-store",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      // Converte strings ISO de volta para Date (JSON não preserva tipo Date)
      const data: MachineStatus = {
        ...json.data,
        timestamp: new Date(json.data.timestamp),
      };

      setStatus(data);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus(); // busca imediata ao montar

    const interval = setInterval(fetchStatus, POLL_INTERVAL);

    // Cleanup: cancela o polling quando o componente for desmontado
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { status, isConnected, isLoading, error };
}
