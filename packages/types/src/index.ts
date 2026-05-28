// ============================================================
// Tipos compartilhados do sistema de monitoramento industrial
// Usados tanto no frontend (web) quanto no backend (api)
// ============================================================

/**
 * Estado atual da máquina misturador.
 * Representa um snapshot completo em determinado instante.
 */
export interface MachineStatus {
  id: string;
  timestamp: Date;
  /** Estado operacional da máquina */
  state: MachineState;
  metrics: MachineMetrics;
  oee: OEEMetrics;
}

/** Possíveis estados operacionais */
export type MachineState = "RUNNING" | "STOPPED" | "MAINTENANCE" | "ERROR";

/** Métricas físicas do misturador */
export interface MachineMetrics {
  /** Temperatura interna em graus Celsius */
  temperature: number;
  /** Rotações por minuto do eixo do misturador */
  rpm: number;
  /** Tempo de operação acumulado em segundos */
  uptime: number;
  /** Eficiência geral em percentual (0-100) */
  efficiency: number;
}

/**
 * OEE - Overall Equipment Effectiveness
 * Padrão industrial para medir produtividade de equipamentos.
 * OEE = Disponibilidade × Performance × Qualidade
 */
export interface OEEMetrics {
  /** OEE geral calculado (0-100) */
  overall: number;
  /** % de tempo que a máquina esteve disponível para operar */
  availability: number;
  /** % de velocidade real vs. velocidade nominal */
  performance: number;
  /** % de produtos conformes vs. total produzido */
  quality: number;
}

/**
 * Alerta gerado pelo sistema de monitoramento.
 * Criado automaticamente quando métricas excedem limites.
 */
export interface Alert {
  id: string;
  level: AlertLevel;
  message: string;
  /** Componente/sensor que originou o alerta */
  component: string;
  timestamp: Date;
  /** Se o operador já reconheceu/visualizou o alerta */
  acknowledged: boolean;
}

/** Níveis de severidade dos alertas */
export type AlertLevel = "INFO" | "WARNING" | "CRITICAL";

/**
 * Ponto histórico de métricas - usado para popular os gráficos.
 * Armazenado a cada atualização de estado.
 */
export interface MetricHistory {
  timestamp: Date;
  temperature: number;
  rpm: number;
  efficiency: number;
}

/** Configurações de limites operacionais do misturador */
export interface MachineThresholds {
  temperature: { warning: number; critical: number; max: number };
  rpm: { min: number; max: number; nominal: number };
  efficiency: { warning: number; critical: number };
}

/** Resposta padrão da API */
export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  success: boolean;
}
// ============================================================
// Limites operacionais padrão do misturador (fonte única de verdade)
// ------------------------------------------------------------
// Centralizados aqui para que frontend (cards, gráfico) e backend
// (simulador, geração de alertas) usem EXATAMENTE os mesmos valores.
// Alterar um limite aqui propaga para todo o sistema automaticamente.
// ============================================================
export const DEFAULT_THRESHOLDS: MachineThresholds = {
  temperature: {
    warning: 75,   // °C — início da faixa de atenção (amarelo)
    critical: 82,  // °C — início da faixa crítica (vermelho)
    max: 85,        // °C — máximo operacional exibido nos cards/gráfico
  },
  rpm: {
    min: 900,       // RPM — abaixo disso em operação gera alerta
    nominal: 1200,  // RPM — velocidade alvo de trabalho
    max: 1500,      // RPM — máximo exibido nos cards
  },
  efficiency: {
    warning: 80,   // % — eficiência abaixo disso é preocupante
    critical: 60,  // % — eficiência crítica
  },
};
