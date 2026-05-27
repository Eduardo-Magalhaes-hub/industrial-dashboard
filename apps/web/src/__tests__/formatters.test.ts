/**
 * Testes das funções utilitárias de formatação.
 * São funções puras — fáceis de testar sem mocks.
 */
import { formatUptime, formatDecimal } from "@/lib/formatters";

describe("formatUptime", () => {
  it("deve retornar segundos para valores menores que 60", () => {
    expect(formatUptime(45)).toBe("45s");
  });

  it("deve retornar minutos para valores entre 60 e 3600", () => {
    expect(formatUptime(120)).toBe("2m");
    expect(formatUptime(90)).toBe("1m");
  });

  it("deve retornar horas e minutos corretamente", () => {
    expect(formatUptime(5 * 3600 + 23 * 60)).toBe("5h 23m");
    expect(formatUptime(3600)).toBe("1h 0m");
  });
});

describe("formatDecimal", () => {
  it("deve formatar com 1 casa decimal", () => {
    expect(formatDecimal(72.456)).toBe("72.5");
    expect(formatDecimal(100)).toBe("100.0");
  });
});
