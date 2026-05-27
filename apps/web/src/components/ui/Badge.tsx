import { cn } from "@/lib/cn";
import type { AlertLevel, MachineState } from "@industrial/types";

// ---- Badge de nível de alerta ----
interface AlertBadgeProps {
  level: AlertLevel;
  className?: string;
}

const alertStyles: Record<AlertLevel, string> = {
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
  WARNING:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  INFO:     "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
};

const alertLabels: Record<AlertLevel, string> = {
  CRITICAL: "Crítico",
  WARNING: "Aviso",
  INFO: "Info",
};

export function AlertBadge({ level, className }: AlertBadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold", alertStyles[level], className)}>
      {alertLabels[level]}
    </span>
  );
}

// ---- Badge de estado da máquina ----
interface StateBadgeProps {
  state: MachineState;
}

const stateStyles: Record<MachineState, string> = {
  RUNNING:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  STOPPED:     "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MAINTENANCE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ERROR:       "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const stateLabels: Record<MachineState, string> = {
  RUNNING: "Em Operação",
  STOPPED: "Parada",
  MAINTENANCE: "Manutenção",
  ERROR: "Erro",
};

export function StateBadge({ state }: StateBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold", stateStyles[state])}>
      <span className={cn("w-2 h-2 rounded-full", {
        "bg-green-500 animate-pulse": state === "RUNNING",
        "bg-slate-400": state === "STOPPED",
        "bg-amber-500 animate-pulse-slow": state === "MAINTENANCE",
        "bg-red-500 animate-pulse": state === "ERROR",
      })} />
      {stateLabels[state]}
    </span>
  );
}
