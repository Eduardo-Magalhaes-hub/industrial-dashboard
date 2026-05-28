/**
 * Testes de invariantes dos limites operacionais (DEFAULT_THRESHOLDS).
 *
 * Diferente dos testes de componente, este verifica regras do DOMÍNIO:
 * a constante centralizada precisa manter coerência interna (warning < critical < max)
 * e respeitar o spec do desafio (temperatura máxima = 85°C).
 *
 * Se alguém alterar um valor de forma incoerente no futuro, este teste pega.
 */
import { DEFAULT_THRESHOLDS } from "@industrial/types";

describe("DEFAULT_THRESHOLDS — invariantes do domínio", () => {

  describe("temperatura", () => {
    const t = DEFAULT_THRESHOLDS.temperature;

    it("deve respeitar a ordem warning < critical < max", () => {
      expect(t.warning).toBeLessThan(t.critical);
      expect(t.critical).toBeLessThan(t.max);
    });

    it("deve ter máximo igual a 85°C conforme especificação do desafio", () => {
      // O layout mínimo do desafio mostra explicitamente "Máx: 85°C"
      expect(t.max).toBe(85);
    });

    it("deve ter valores positivos e realistas para misturador industrial", () => {
      expect(t.warning).toBeGreaterThan(0);
      expect(t.max).toBeLessThanOrEqual(150); // teto físico razoável
    });
  });

  describe("RPM", () => {
    const r = DEFAULT_THRESHOLDS.rpm;

    it("deve respeitar a ordem min < nominal < max", () => {
      expect(r.min).toBeLessThan(r.nominal);
      expect(r.nominal).toBeLessThan(r.max);
    });

    it("deve ter RPM nominal compatível com o card (1500 max)", () => {
      // O card de RPM exibe "Máx: 1500RPM" — nominal deve estar abaixo disso
      expect(r.nominal).toBeLessThanOrEqual(r.max);
      expect(r.max).toBe(1500);
    });
  });

  describe("eficiência", () => {
    const e = DEFAULT_THRESHOLDS.efficiency;

    it("deve respeitar a ordem critical < warning (valores baixos = ruins)", () => {
      // Para eficiência, valores BAIXOS são problema — invertido em relação à temperatura
      expect(e.critical).toBeLessThan(e.warning);
    });

    it("deve ter valores percentuais válidos (0-100)", () => {
      expect(e.warning).toBeGreaterThanOrEqual(0);
      expect(e.warning).toBeLessThanOrEqual(100);
      expect(e.critical).toBeGreaterThanOrEqual(0);
      expect(e.critical).toBeLessThanOrEqual(100);
    });
  });

});