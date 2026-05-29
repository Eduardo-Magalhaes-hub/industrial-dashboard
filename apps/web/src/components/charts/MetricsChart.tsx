"use client";

/**
 * Gráfico de histórico de métricas usando Recharts.
 *
 * Exibe temperatura e RPM em eixos Y duplos (escalas diferentes).
 * Recharts foi escolhido por ser declarativo, funcionar bem com React e
 * ter suporte nativo a responsividade via ResponsiveContainer.
 */
import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { MetricHistory } from "@industrial/types";
import { DEFAULT_THRESHOLDS } from "@industrial/types";
import { formatTime } from "@/lib/formatters";

interface MetricsChartProps {
  data: MetricHistory[];
}

// Limites de temperatura para as linhas de referência do gráfico.
// Vêm da mesma fonte usada por cards e simulador, mantendo tudo sincronizado.
const TEMP = DEFAULT_THRESHOLDS.temperature;

export function MetricsChart({ data }: MetricsChartProps) {
  // useMemo evita reprocessar todos os pontos a cada render do componente.
  // Só recalcula quando `data` muda (a cada novo polling), não em re-renders
  // disparados por outros estados do pai.
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        time: formatTime(new Date(point.timestamp)),
        temperature: +point.temperature.toFixed(1),
        rpm: +Number(point.rpm).toFixed(0),
        efficiency: +point.efficiency.toFixed(1),
      })),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-slate-400">
        Aguardando dados históricos...
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />

        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: "currentColor" }}
          tickLine={false}
          className="text-slate-400"
          // Exibe apenas alguns ticks para não poluir o eixo
          interval={Math.floor(chartData.length / 6)}
        />

        {/* Eixo esquerdo: temperatura (°C). Topo do eixo um pouco acima do
            máximo operacional (85°C) para dar respiro visual às linhas. */}
        <YAxis
          yAxisId="temp"
          orientation="left"
          domain={[30, 90]}
          tick={{ fontSize: 11, fill: "currentColor" }}
          tickLine={false}
          className="text-slate-400"
          tickFormatter={(v) => `${v}°`}
        />

        {/* Eixo direito: RPM */}
        <YAxis
          yAxisId="rpm"
          orientation="right"
          domain={[0, 1600]}
          tick={{ fontSize: 11, fill: "currentColor" }}
          tickLine={false}
          className="text-slate-400"
          tickFormatter={(v) => `${v}`}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: "rgb(15 23 42)",
            border: "1px solid rgb(30 41 59)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#f8fafc",
          }}
          formatter={(value: number, name: string) => {
            if (name === "Temperatura") return [`${value}°C`, name];
            if (name === "RPM") return [`${value} RPM`, name];
            return [`${value}%`, name];
          }}
        />

        <Legend wrapperStyle={{ fontSize: "12px" }} />

        {/* Linhas de limite — valores vêm de DEFAULT_THRESHOLDS, então
            mudam junto com cards e simulador se o limite for ajustado. */}
        <ReferenceLine yAxisId="temp" y={TEMP.critical} stroke="#ef4444" strokeDasharray="4 4"
          label={{ value: `Crítico ${TEMP.critical}°C`, fontSize: 10, fill: "#ef4444", position: "insideTopRight" }} />
        <ReferenceLine yAxisId="temp" y={TEMP.warning} stroke="#f59e0b" strokeDasharray="4 4"
          label={{ value: `Aviso ${TEMP.warning}°C`, fontSize: 10, fill: "#f59e0b", position: "insideTopRight" }} />

        {/* Linhas de dados */}
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="temperature"
          name="Temperatura"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          yAxisId="rpm"
          type="monotone"
          dataKey="rpm"
          name="RPM"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          yAxisId="temp"
          type="monotone"
          dataKey="efficiency"
          name="Eficiência %"
          stroke="#22c55e"
          strokeWidth={1.5}
          strokeDasharray="4 2"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}