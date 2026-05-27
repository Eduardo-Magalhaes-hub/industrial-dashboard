/**
 * Funções utilitárias de formatação.
 * Centralizadas aqui para não duplicar lógica nos componentes.
 */

/** Converte segundos totais em string legível: "5h 23m" */
export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Formata número com 1 casa decimal */
export function formatDecimal(n: number): string {
  return n.toFixed(1);
}

/** Formata timestamp para horário local: "14:32:05" */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Formata data completa: "27/05/2026 14:32" */
export function formatDateTime(date: Date): string {
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Retorna string de tempo relativo: "há 2 minutos" */
export function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  return `há ${diffH}h`;
}
