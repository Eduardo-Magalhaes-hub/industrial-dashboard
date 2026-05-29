/**
 * Testes das funções utilitárias de formatação.
 * São funções puras, fáceis de testar sem mocks.
 */
import { formatUptime, formatDecimal, formatRelativeTime } from "@/lib/formatters";

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

describe("formatRelativeTime", () => {
  // jest.useFakeTimers() congela o relógio do sistema em "agora", permitindo
  // testar tempo relativo de forma determinística. Sem isso, os testes
  // poderiam falhar por causa de milissegundos de diferença na execução.
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-27T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("retorna 'agora mesmo' para diferenças menores que 1 minuto", () => {
    const recent = new Date("2026-05-27T11:59:30Z"); // 30s atrás
    expect(formatRelativeTime(recent)).toBe("agora mesmo");
  });

  it("retorna minutos para diferenças entre 1 e 60 minutos", () => {
    const fiveMinAgo = new Date("2026-05-27T11:55:00Z");
    expect(formatRelativeTime(fiveMinAgo)).toBe("há 5 min");
  });

  it("retorna horas para diferenças maiores que 60 minutos", () => {
    const twoHoursAgo = new Date("2026-05-27T10:00:00Z");
    expect(formatRelativeTime(twoHoursAgo)).toBe("há 2h");
  });
});