"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Settings, Wifi, WifiOff, Factory } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

interface HeaderProps {
  isConnected: boolean;
  /** Timestamp da última leitura recebida da API. null = ainda carregando. */
  lastUpdate?: Date | null;
}

export function Header({ isConnected, lastUpdate }: HeaderProps) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo + Título */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-50 text-base leading-tight">
              Dashboard Industrial
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
              Misturador Industrial — Linha A
            </p>
          </div>
        </div>

        {/* Controles direita */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Timestamp da última atualização — só aparece em telas md+ para
              não poluir o header no mobile */}
          {lastUpdate && (
            <LastUpdateIndicator timestamp={lastUpdate} isConnected={isConnected} />
          )}

          {/* Indicador de conexão */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
            isConnected
              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          )}>
            {isConnected
              ? <><Wifi className="w-3.5 h-3.5" /><span className="hidden sm:inline">Conectado</span></>
              : <><WifiOff className="w-3.5 h-3.5" /><span className="hidden sm:inline">Sem conexão</span></>
            }
          </div>

          {/* Toggle Dark/Light */}
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === "dark"
              ? <Sun className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-slate-600" />
            }
          </button>

          {/* Configurações (placeholder visual) */}
          <button
            aria-label="Configurações"
            className="w-9 h-9 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Mostra "há Xs" desde a última atualização e atualiza a contagem
 * a cada segundo. Fica vermelho se passou de 15s sem dados novos
 * (indício de que algo está errado mesmo com isConnected=true).
 */
function LastUpdateIndicator({
  timestamp,
  isConnected,
}: {
  timestamp: Date;
  isConnected: boolean;
}) {
  // Tick interno: força re-render a cada segundo para a contagem avançar.
  // Sem isso o componente só atualizaria quando `timestamp` mudasse (a cada 3s).
  const [, forceTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsAgo = Math.floor((Date.now() - timestamp.getTime()) / 1000);
  const isStale = secondsAgo > 15; // mais de 15s sem update = dado obsoleto

  // Em mobile escondemos para economizar espaço (hidden md:flex)
  return (
    <div
      className={cn(
        "hidden md:flex items-center text-xs font-medium tabular-nums px-2",
        isStale || !isConnected
          ? "text-red-600 dark:text-red-400"
          : "text-slate-500 dark:text-slate-400"
      )}
      title={`Última leitura: ${timestamp.toLocaleTimeString("pt-BR")}`}
    >
      {secondsAgo < 60
        ? `Atualizado há ${secondsAgo}s`
        : `Atualizado há ${Math.floor(secondsAgo / 60)}min`}
    </div>
  );
}