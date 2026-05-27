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
import { Thermometer, Gauge, Clock, Activity } from "lucide-react";

export default function DashboardPage() {
  const { status, isConnected, isLoading } = useMachineStatus();
  const { alerts, acknowledgeAlert } = useAlerts();
  const { history } = useMetricHistory();

  const metrics = status?.metrics;
  const oee = status?.oee;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header isConnected={isConnected} />

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ---- Linha 1: Cards de métricas ---- */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MachineStateCard
            state={status?.state ?? "STOPPED"}
            isLoading={isLoading}
          />
          <MetricCard
            title="Temperatura"
            value={metrics?.temperature ?? 0}
            unit="°C"
            icon={<Thermometer className="w-5 h-5" />}
            max={95}
            warningThreshold={80}
            criticalThreshold={88}
            isLoading={isLoading}
          />
          <MetricCard
            title="RPM"
            value={metrics?.rpm ?? 0}
            unit="RPM"
            icon={<Gauge className="w-5 h-5" />}
            max={1500}
            warningThreshold={900}
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
