"use client";

import { Bell, CheckCheck } from "lucide-react";
import type { Alert } from "@industrial/types";
import { AlertBadge } from "@/components/ui/Badge";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/cn";

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm flex flex-col">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Alertas Recentes</h2>
          {unacknowledgedCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold animate-pulse">
              {unacknowledgedCount}
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400">{alerts.length} total</span>
      </div>

      {/* Lista de alertas */}
      <div className="flex-1 overflow-y-auto max-h-64 divide-y divide-slate-100 dark:divide-slate-800">
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            Nenhum alerta registrado
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onAcknowledge={onAcknowledge}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
}

function AlertItem({ alert, onAcknowledge }: AlertItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50",
      alert.acknowledged && "opacity-60"
    )}>
      {/* Indicador colorido lateral */}
      <div className={cn("w-1 self-stretch rounded-full flex-shrink-0", {
        "bg-red-500":   alert.level === "CRITICAL",
        "bg-amber-500": alert.level === "WARNING",
        "bg-blue-500":  alert.level === "INFO",
      })} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <AlertBadge level={alert.level} />
          <span className="text-xs text-slate-400">
            {formatRelativeTime(alert.timestamp)}
          </span>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{alert.message}</p>
        <p className="text-xs text-slate-400 mt-0.5">{alert.component}</p>
      </div>

      {/* Botão de reconhecimento */}
      {!alert.acknowledged && (
        <button
          onClick={() => onAcknowledge(alert.id)}
          title="Reconhecer alerta"
          className="flex-shrink-0 text-slate-400 hover:text-green-500 transition-colors"
        >
          <CheckCheck className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
