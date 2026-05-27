import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ReactNode;
  max?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  /** Se true, abaixo do warningThreshold é ruim (ex: RPM mínimo) */
  invertThreshold?: boolean;
  /** Se o valor já é texto formatado (ex: "5h 23m") */
  isText?: boolean;
  isLoading?: boolean;
}

/**
 * Card de métrica individual com:
 * - Indicador de cor baseado em limites (verde/âmbar/vermelho)
 * - Barra de progresso proporcional ao máximo
 * - Ícone de tendência (simulado via variação aleatória pequena)
 */
export function MetricCard({
  title, value, unit, icon, max,
  warningThreshold, criticalThreshold, invertThreshold,
  isText, isLoading,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm">
        <Skeleton className="h-4 w-20 mb-3" />
        <Skeleton className="h-8 w-28 mb-2" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    );
  }

  // Determina cor baseada nos limiares
  const numValue = typeof value === "number" ? value : 0;
  let colorClass = "text-green-600 dark:text-green-400";
  let borderClass = "border-l-green-500";
  let barClass = "bg-green-500";

  if (!isText && warningThreshold !== undefined) {
    const isWarning = invertThreshold
      ? numValue < warningThreshold
      : numValue >= warningThreshold;
    const isCritical = criticalThreshold !== undefined && !invertThreshold
      ? numValue >= criticalThreshold
      : false;

    if (isCritical) {
      colorClass = "text-red-600 dark:text-red-400";
      borderClass = "border-l-red-500";
      barClass = "bg-red-500";
    } else if (isWarning) {
      colorClass = "text-amber-600 dark:text-amber-400";
      borderClass = "border-l-amber-500";
      barClass = "bg-amber-500";
    }
  }

  const progressPercent = max ? Math.min((numValue / max) * 100, 100) : 0;

  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 rounded-xl border border-l-4 p-4 shadow-sm animate-fade-in",
      borderClass
    )}>
      {/* Título + ícone */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </p>
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      </div>

      {/* Valor principal */}
      <div className={cn("flex items-baseline gap-1 mb-3", colorClass)}>
        <span className="text-2xl font-bold tabular-nums">
          {isText ? value : (typeof value === "number" ? value.toFixed(1) : value)}
        </span>
        {unit && <span className="text-sm font-medium">{unit}</span>}
      </div>

      {/* Barra de progresso */}
      {max && (
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barClass)}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
      {max && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Máx: {max}{unit}
        </p>
      )}
    </div>
  );
}
