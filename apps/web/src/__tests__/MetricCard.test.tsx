/**
 * Testes do componente MetricCard.
 * Verifica renderização correta para diferentes estados de alerta,
 * incluindo lógica de thresholds e modo invertido (ex: RPM mínimo).
 */
import { render, screen } from "@testing-library/react";
import { Thermometer } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";

describe("MetricCard", () => {
  const defaultProps = {
    title: "Temperatura",
    value: 72,
    unit: "°C",
    icon: <Thermometer data-testid="icon" />,
    max: 95,
    warningThreshold: 80,
    criticalThreshold: 88,
  };

  it("deve renderizar o título e valor corretamente", () => {
    render(<MetricCard {...defaultProps} />);
    expect(screen.getByText("Temperatura")).toBeInTheDocument();
    expect(screen.getByText("72.0")).toBeInTheDocument();
    expect(screen.getByText("°C")).toBeInTheDocument();
  });

  it("deve mostrar skeleton quando isLoading é true", () => {
    const { container } = render(<MetricCard {...defaultProps} isLoading />);
    // Skeleton usa animate-pulse — verifica que o valor principal não aparece
    expect(screen.queryByText("72.0")).not.toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("deve renderizar valor de texto quando isText é true", () => {
    render(
      <MetricCard
        title="Uptime"
        value="5h 23m"
        icon={<Thermometer />}
        isText
      />
    );
    expect(screen.getByText("5h 23m")).toBeInTheDocument();
  });

  it("deve exibir o máximo quando max é fornecido", () => {
    render(<MetricCard {...defaultProps} />);
    expect(screen.getByText("Máx: 95°C")).toBeInTheDocument();
  });

  // ---- Novos testes: comportamento de thresholds ----

  it("deve aplicar cor crítica (red border) quando valor passa do criticalThreshold", () => {
    const { container } = render(
      <MetricCard {...defaultProps} value={90} />
    );
    // 90 > criticalThreshold (88) → borda esquerda vermelha
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-l-red-500");
  });

  it("deve aplicar cor warning (amber border) entre warning e critical", () => {
    const { container } = render(
      <MetricCard {...defaultProps} value={82} />
    );
    // 82 >= warning (80) mas < critical (88) → borda âmbar, não vermelha
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-l-amber-500");
    expect(card.className).not.toContain("border-l-red-500");
  });

  it("deve aplicar warning quando valor está ABAIXO do threshold com invertThreshold", () => {
    // invertThreshold é usado para métricas onde valores BAIXOS são ruins (ex: RPM mínimo)
    const { container } = render(
      <MetricCard
        title="RPM"
        value={850}
        unit="RPM"
        icon={<Thermometer />}
        max={1500}
        warningThreshold={900}
        invertThreshold
      />
    );
    // 850 < 900 → deve disparar warning (borda âmbar)
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("border-l-amber-500");
  });
});