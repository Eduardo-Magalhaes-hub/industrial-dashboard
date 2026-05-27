import { BarChart3 } from "lucide-react";
import type { OEEMetrics } from "@industrial/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

interface OEEPanelProps {
  oee?: OEEMetrics;
  isLoading: boolean;
}

/**
 * Painel de OEE (Overall Equipment Effectiveness).
 *
 * Fórmula: OEE = Disponibilidade × Performance × Qualidade
 * Padrão mundial: OEE ≥ 85% = classe mundial
 */
export function OEEPanel({ oee, isLoading }: OEEPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border shadow-sm">
      <div className="flex items-center gap-2 p-4 border-b">
        <BarChart3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        <h2 className="font-semibold text-slate-800 dark:text-slate-200">
          Métricas de Eficiência (OEE)
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* OEE Geral em destaque */}
        <OEEHighlight value={oee?.overall} isLoading={isLoading} />

        {/* Três componentes do OEE */}
        <div className="space-y-3">
          <OEEBar label="Disponibilidade" value={oee?.availability} isLoading={isLoading}
            tooltip="Tempo disponível / Tempo total planejado" />
          <OEEBar label="Performance" value={oee?.performance} isLoading={isLoading}
            tooltip="Velocidade real / Velocidade nominal" />
          <OEEBar label="Qualidade" value={oee?.quality} isLoading={isLoading}
            tooltip="Produtos conformes / Total produzido" />
        </div>
      </div>
    </div>
  );
}

function OEEHighlight({ value, isLoading }: { value?: number; isLoading: boolean }) {
  if (isLoading) return <Skeleton className="h-16 w-full rounded-lg" />;

  const v = value ?? 0;
  const colorClass = v >= 85 ? "text-green-600 dark:text-green-400" : v >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";

  return (
    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
          OEE Geral
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {v >= 85 ? "✓ Classe Mundial (≥85%)" : v >= 60 ? "⚠ Aceitável (60-85%)" : "✗ Baixo (<60%)"}
        </p>
      </div>
      <span className={cn("text-3xl font-bold tabular-nums", colorClass)}>
        {v.toFixed(1)}%
      </span>
    </div>
  );
}

interface OEEBarProps {
  label: string;
  value?: number;
  isLoading: boolean;
  tooltip: string;
}

function OEEBar({ label, value, isLoading, tooltip }: OEEBarProps) {
  if (isLoading) return <Skeleton className="h-8 w-full" />;

  const v = value ?? 0;
  const barColor = v >= 90 ? "bg-green-500" : v >= 75 ? "bg-amber-500" : "bg-red-500";

  return (
    <div title={tooltip}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-slate-800 dark:text-slate-200">
          {v.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor)}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}
