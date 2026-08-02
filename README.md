# 🛡️ CycloneDX SCA Visualizer & Dependency Tree Platform

![Version](https://img.shields.io/badge/version-1.2.0-cyan.svg)
![CycloneDX](https://img.shields.io/badge/CycloneDX-JSON_%26_XML_(v1.2--v1.6)-cyan.svg)
![Node LTS](https://img.shields.io/badge/Node.js-24_LTS-emerald.svg)
![Tests](https://img.shields.io/badge/Tests-14_Passed_%7C_73_Tests-emerald.svg)
![Security](https://img.shields.io/badge/Security-100%25_Client--Side_RAM-purple.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

> **Inteligência Executiva & Visualizador de Grafo de Supply Chain de Software (CycloneDX JSON & XML)**  
> Aplicação Web Single-Page (SPA) 100% Client-Side para análise visual de Software Bill of Materials (SBOM), cálculo logarítmico de SCA Health Rating, matriz de licenças, árvore hierárquica e grafo 2D de dependências com rastreamento de caminho de impacto ancestral.

---

## 🏗️ Arquitetura & Fluxo de Dados (Privacy-First)

Toda a ingestão, validação de schemas, detecção de ciclos e renderização do grafo ocorrem exclusivamente em memória local RAM do navegador do usuário. Nenhum dado é enviado para a nuvem ou servidores externos.

```mermaid
graph TD
    A["Arquivo SBOM (JSON / XML)"] -->|Drag & Drop / Input| B["Fast XML & JSON Parser Engine"]
    B -->|Proteção XXE & Cycle DFS| C["Normalizador CycloneDX"]
    C -->|Zustand Store| D["Central ScaStore"]
    
    D --> E["Executive Security Dashboard"]
    D --> F["Navegador Topológico 2D (React Flow + Dagre)"]
    D --> G["Árvore Hierárquica Colapsável (TreeView)"]
    D --> H["Explorador de Pacotes & Licenças"]
```

---

## 🌟 Principais Recursos

- **100% Client-Side & Privacy-First**: Zero persistência em servidor. Seus SBOMs e fontes de código permanecem protegidos no ambiente do cliente.
- **Landing Page com Paridade Executiva**: Página inicial rica com seções de Garantias de Segurança, Recursos, Guia em 3 Passos e FAQ interativo.
- **Dashboard Executivo de Segurança**:
  - **SCA Security Rating (0–100 & Notas A+ a F)**: Fórmula logarítmica ponderada por peso de severidade CVE (Crítico, Alto, Médio, Baixo) e risco de licenças Copyleft.
  - **Gráficos Recharts**: Distribuição de vulnerabilidades, matriz de licenças jurídicas e análise de profundidade da árvore.
  - **Quick Wins de Remediação**: Algoritmo de ROI que prioriza dependências diretas que arrastam o maior número de sub-dependências transitivas vulneráveis.
- **Navegador Topológico 2D Integrado**:
  - Integrado diretamente no **Dashboard Executivo** e presente na aba dedicada **"Grafo 2D de Dependências"**.
  - Layout automatizado hierárquico (LR) com Dagre e React Flow (`@xyflow/react`).
  - Destaque do **Caminho de Impacto** (ancestrais) ao selecionar qualquer nó no grafo.
  - Controles escuros e **MiniMapa** funcional com código de cores por nível.
- **Árvore Hierárquica Colapsável (TreeView)**: Navegação profunda em dependências aninhadas com indicação visual de profundidade.
- **Explorador de Pacotes**: Tabela interativa com busca instantânea, ordenação e modal de detalhes sanitizado contra XSS via DOMPurify.
- **Proteção Anti-XXE & DoS**: Parser XML com DTDs externas estritamente desabilitadas e limite de recursão DFS (`maxDepth = 32`).
- **Internacionalização (i18n)**: Suporte bilíngue em tempo real (Português PT-BR e Inglês EN-US).

---

## 📐 Fórmula de Pontuação (SCA Health Rating)

$$\text{CVE Penalty} = 15 \times \text{Crit} + 6 \times \text{High} + 2 \times \text{Med} + 0.5 \times \text{Low}$$

$$\text{License Penalty} = 10 \times \text{Copyleft} + 2 \times \text{Desconhecida}$$

$$\text{Score} = \max\left(0, 100 - \log_{1.15}(1 + \text{CVE Penalty} + \text{License Penalty})\right)$$

| Score | Nota Conceitual | Nível de Risco |
| :---: | :---: | :---: |
| 95 – 100 | **A+** | Baixo Risco |
| 85 – 94 | **A** | Baixo Risco |
| 70 – 84 | **B+ / B** | Moderado |
| 50 – 69 | **C** | Elevado |
| 30 – 49 | **D** | Alto Risco |
| 0 – 29 | **F** | Crítico |

---

## 🚀 Executando com Docker (Produção)

O projeto inclui um container de produção multi-stage baseado em **Node.js 24 LTS** e **Nginx slim** com cabeçalhos de segurança HTTP pré-configurados:

### 1. Iniciar via Docker Compose:
```bash
docker-compose up -d --build
```
Acesse em seu navegador: **`http://localhost:8081`**

### 2. Build da Imagem Manualmente:
```bash
cd frontend
docker build -t cyclonedx-sca-visualizer:latest .
docker run -d -p 8081:80 --name sca_prod cyclonedx-sca-visualizer:latest
```

---

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- **Node.js**: `>= 24.x LTS`
- **npm**: `>= 10.x`

### Passos para Rodar:
```bash
# Acesse o diretório do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento Vite
npm run dev

# Execute a suíte de testes (Vitest)
npm run test -- --run

# Build de Produção
npm run build
```

---

## 🧪 Suíte de Testes

A aplicação utiliza **Vitest** e **React Testing Library** com cobertura total de unit e integration tests:

```bash
cd frontend
npm run test -- --run
```
- **13 arquivos de teste**
- **69 testes unitários e de integração E2E** (100% aprovados)

---

## 📜 Historico de Versões & Changelog

Consulte o arquivo [`CHANGELOG.md`](./CHANGELOG.md) para visualizar o histórico de atualizações de cada versão.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja `LICENSE` para mais detalhes.
