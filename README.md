# 🏭 Dashboard de Monitoramento Industrial — Misturador

Dashboard em tempo real para monitoramento de um misturador industrial, desenvolvido como solução para o desafio técnico de automação industrial.

## 📸 Visão Geral

O sistema exibe em tempo real:
- **Estado operacional** da máquina (Operando / Parada / Manutenção / Erro)
- **Métricas físicas**: Temperatura (°C), RPM e Tempo de Operação
- **Gráfico histórico** com linhas de temperatura, RPM e eficiência
- **Sistema de alertas** com níveis INFO / WARNING / CRITICAL e reconhecimento
- **OEE** (Overall Equipment Effectiveness) com Disponibilidade, Performance e Qualidade
- **Dark/Light mode** persistido via localStorage

---

## 🗂️ Estrutura do Projeto (Monorepo)

```
industrial-dashboard/
├── apps/
│   ├── web/          # Frontend Next.js 14 + React 18 + Tailwind CSS
│   └── api/          # Backend Express + SQLite (Better-SQLite3)
├── packages/
│   ├── types/        # Interfaces TypeScript compartilhadas (MachineStatus, Alert, etc.)
│   └── eslint-config/
├── turbo.json        # Configuração do Turborepo
└── pnpm-workspace.yaml
```

### Por que esse stack?
- **Turborepo** — orquestração eficiente de builds/dev em monorepo, com cache inteligente
- **Next.js 14** (App Router) — SSR/CSR híbrido, routing nativo, ótimo DX
- **Recharts** — biblioteca de gráficos declarativa, integração natural com React
- **Better-SQLite3** — SQLite síncrono para Node.js, sem overhead de Promise para leituras frequentes
- **pnpm workspaces** — instalação compartilhada de dependências, mais rápido que npm

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js ≥ 18**
- **pnpm** instalado globalmente

```bash
# Instalar pnpm (se necessário)
npm install -g pnpm
```

### 1. Instalar dependências

```bash
# Na raiz do projeto
pnpm install
```

### 2. Popular o banco de dados com dados históricos

```bash
pnpm --filter @industrial/api seed
```

> Isso cria o arquivo `apps/api/industrial.db` com 1440 pontos históricos (2h de operação simulada) e 5 alertas pré-definidos.

### 3. Iniciar em modo desenvolvimento

```bash
# Inicia API (porta 3001) e Web (porta 3000) simultaneamente
pnpm dev
```

Acesse: **http://localhost:3000**

### 4. Executar testes

```bash
pnpm test
```

---

## 🔌 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/health` | Health check do servidor |
| GET | `/api/status/latest` | Estado atual da máquina |
| GET | `/api/status/history?limit=100` | Histórico de métricas |
| GET | `/api/alerts?limit=20` | Lista de alertas |
| PATCH | `/api/alerts/:id/acknowledge` | Reconhecer alerta |

---

## ⚙️ Decisões Técnicas

### Simulação em Tempo Real
O backend usa **polling**: o frontend consulta a API a cada **3 segundos** para o status e a cada **5 segundos** para alertas e histórico. Essa abordagem foi preferida a WebSocket por ser mais simples de implementar, depurar e escalar horizontalmente.

O simulador (`apps/api/src/services/simulator.ts`) gera variações físicas realistas:
- Temperatura oscila em torno de 72°C com ruído gaussiano
- RPM varia em torno de 1200 com desvio de ±80
- Transições de estado (RUNNING → ERROR) são probabilísticas

### Alertas Automáticos
Alertas são criados automaticamente no backend quando métricas ultrapassam limiares pré-definidos:
- Temperatura ≥ 80°C → WARNING
- Temperatura ≥ 88°C → CRITICAL
- RPM < 900 (em operação) → WARNING

### Persistência do Histórico
Dados são armazenados no SQLite a cada tick do simulador (3s), com índices para queries eficientes por timestamp. LocalStorage é usado apenas para a preferência de tema.

### OEE (Overall Equipment Effectiveness)
Padrão ISO 22400 para medir produtividade industrial:
- **OEE = Disponibilidade × Performance × Qualidade**
- OEE ≥ 85% = Classe Mundial
- OEE 60–85% = Aceitável
- OEE < 60% = Baixo

---

## 🧪 Estratégia de Testes

- **Unitários** (`jest` + `@testing-library/react`): componentes de UI e funções utilitárias
- **Foco**: comportamento visível pelo usuário, não detalhes de implementação
- **Cobertura priorizada**: MetricCard (renderização por estado), OEEPanel, formatters (funções puras)

---

## 📦 Scripts Disponíveis

```bash
pnpm dev          # Desenvolvimento (web + api)
pnpm build        # Build de produção
pnpm test         # Testes
pnpm lint         # Linting
pnpm type-check   # Verificação TypeScript

# Comandos por workspace:
pnpm --filter @industrial/api seed        # Popular banco de dados
pnpm --filter @industrial/web test:watch  # Testes em modo watch
```

---

## 🎥 Demonstração

> Screenshots ou vídeo serão adicionados após a execução completa do projeto.

---

## 👤 Autor

Desenvolvido como solução para o Desafio Técnico de Dashboard de Automação Industrial.
