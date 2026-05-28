/**
 * Página principal do dashboard.
 * É um Client Component porque precisa de hooks para dados em tempo real.
 */
"use client";

import { Header } from "@/components/dashboard/Header";
import { MachineStateCard } from "@/components/dashboard/MachineStateCard";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MetricsChart } from "@/components/charts/MetricsChart";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { OEEPanel } from "@/components/dashboard/OEEPanel";
import { useMachineStatus } from "@/hooks/useMachineStatus";
import { useAlerts } from "@/hooks/useAlerts";
import { useMetricHistory } from "@/hooks/useMetricHistory";
import { formatUptime } from "@/lib/formatters";
import { DEFAULT_THRESHOLDS } from "@industrial/types";
import { Thermometer, Gauge, Clock, Activity } from "lucide-react";

// Limites operacionais centralizados em @industrial/types.
// Os cards usam estes valores para máximo, faixas de aviso e crítico —
// nenhum número de limite fica hardcoded no componente.
const TEMP = DEFAULT_THRESHOLDS.temperature;
const RPM = DEFAULT_THRESHOLDS.rpm;

export default function DashboardPage() {
  const { status, isConnected, isLoading } = useMachineStatus();
  const { alerts, acknowledgeAlert } = useAlerts();
  const { history } = useMetricHistory();

  const metrics = status?.metrics;
  const oee = status?.oee;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header recebe lastUpdate para exibir há quanto tempo veio a última leitura.
          Em dashboard industrial isso é crítico: se a tela travar sem mostrar,
          o operador toma decisões com base em dado obsoleto. */}
      <Header isConnected={isConnected} lastUpdate={status?.timestamp ?? null} />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ---- Linha 1: Cards de métricas ----
            Mobile: 1 coluna (cards empilhados, fáceis de ler)
            Tablet: 2 colunas
            Desktop: 4 colunas lado a lado */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MachineStateCard
            state={status?.state ?? "STOPPED"}
            isLoading={isLoading}
          />
          <MetricCard
            title="Temperatura"
            value={metrics?.temperature ?? 0}
            unit="°C"
            icon={<Thermometer className="w-5 h-5" />}
            max={TEMP.max}
            warningThreshold={TEMP.warning}
            criticalThreshold={TEMP.critical}
            isLoading={isLoading}
          />
          <MetricCard
            title="RPM"
            value={metrics?.rpm ?? 0}
            unit="RPM"
            icon={<Gauge className="w-5 h-5" />}
            max={RPM.max}
            warningThreshold={RPM.min}
            isLoading={isLoading}
            invertThreshold // abaixo do warning é ruim
          />
          <MetricCard
            title="Tempo de Operação"
            value={formatUptime(metrics?.uptime ?? 0)}
            icon={<Clock className="w-5 h-5" />}
            isLoading={isLoading}
            isText
          />
        </section>

        {/* ---- Linha 2: Gráfico de métricas ---- */}
        <section>
          <div className="bg-white dark:bg-slate-900 rounded-xl border p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-brand-500" />
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                Histórico de Métricas — Últimos 5 minutos
              </h2>
            </div>
            <MetricsChart data={history} />
          </div>
        </section>

        {/* ---- Linha 3: Alertas + OEE ---- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AlertsPanel alerts={alerts} onAcknowledge={acknowledgeAlert} />
          <OEEPanel oee={oee} isLoading={isLoading} />
        </section>

      </main>
    </div>
  );
}