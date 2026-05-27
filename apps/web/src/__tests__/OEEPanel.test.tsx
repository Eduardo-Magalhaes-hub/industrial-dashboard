import { render, screen } from "@testing-library/react";
import { OEEPanel } from "@/components/dashboard/OEEPanel";

const mockOEE = {
  overall: 92.0,
  availability: 98.0,
  performance: 95.0,
  quality: 94.0,
};

describe("OEEPanel", () => {
  it("deve renderizar o título do painel", () => {
    render(<OEEPanel oee={mockOEE} isLoading={false} />);
    expect(screen.getByText("Métricas de Eficiência (OEE)")).toBeInTheDocument();
  });

  it("deve exibir mensagem de classe mundial para OEE ≥ 85%", () => {
    render(<OEEPanel oee={mockOEE} isLoading={false} />);
    expect(screen.getByText(/Classe Mundial/)).toBeInTheDocument();
  });

  it("deve exibir os três componentes do OEE", () => {
    render(<OEEPanel oee={mockOEE} isLoading={false} />);
    expect(screen.getByText("Disponibilidade")).toBeInTheDocument();
    expect(screen.getByText("Performance")).toBeInTheDocument();
    expect(screen.getByText("Qualidade")).toBeInTheDocument();
  });

  it("deve mostrar skeletons quando isLoading é true", () => {
    const { container } = render(<OEEPanel isLoading={true} />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });
});
