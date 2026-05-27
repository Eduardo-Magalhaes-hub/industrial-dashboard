import type { MachineState } from "@industrial/types";
import { StateBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/cn";

interface MachineStateCardProps {
  state: MachineState;
  isLoading: boolean;
}

const stateColors: Record<MachineState, string> = {
  RUNNING:     "border-l-green-500",
  STOPPED:     "border-l-slate-400",
  MAINTENANCE: "border-l-amber-500",
  ERROR:       "border-l-red-500",
};

const stateMessages: Record<MachineState, string> = {
  RUNNING:     "Operando normalmente",
  STOPPED:     "Máquina desligada",
  MAINTENANCE: "Em manutenção preventiva",
  ERROR:       "Verificação necessária!",
};

export function MachineStateCard({ state, isLoading }: MachineStateCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-36" />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white dark:bg-slate-900 rounded-xl border border-l-4 p-4 shadow-sm animate-fade-in",
      stateColors[state]
    )}>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
        Estado da Máquina
      </p>
      <StateBadge state={state} />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {stateMessages[state]}
      </p>
    </div>
  );
}
