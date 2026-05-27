/**
 * Testes do componente MetricCard.
 * Verifica renderização correta para diferentes estados de alerta.
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
});
