<div align="right">

[🇧🇷 Português](README.pt-BR.md) &nbsp;|&nbsp; [🇺🇸 English](README.md)

</div>

# 🛡️ CycloneDX SCA Visualizer & Dependency Tree Platform

[![GitHub Repo](https://img.shields.io/badge/GitHub-brunoez%2Fsca-blue?logo=github)](https://github.com/brunoez/sca)
[![GHCR Image](https://img.shields.io/badge/GHCR-ghcr.io%2Fbrunoez%2Fsca-blue?logo=docker)](https://github.com/brunoez/sca/pkgs/container/sca)
![Version](https://img.shields.io/badge/version-1.7.3-cyan.svg)
![CycloneDX](https://img.shields.io/badge/CycloneDX-JSON_%26_XML_(v1.2--v1.6)-cyan.svg)
![Node LTS](https://img.shields.io/badge/Node.js-24_LTS-emerald.svg)
![Tests](https://img.shields.io/badge/Tests-17_Passed_%7C_86_Tests-emerald.svg)
![Security](https://img.shields.io/badge/Security-100%25_Client--Side_RAM-purple.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

> **Inteligência Executiva & Visualizador de Grafo de Supply Chain de Software (CycloneDX JSON & XML)**  
> Aplicação Web Single-Page (SPA) 100% Client-Side para análise visual de Software Bill of Materials (SBOM), cálculo de SCA Health Rating com memória de cálculo interativa, matriz de licenças, árvore hierárquica e grafo 2D de dependências com rastreamento de caminho de impacto ancestral.
>
> 🌐 **Demonstração Online:** [https://sca.brunoizidorio.com.br](https://sca.brunoizidorio.com.br)

---

## 📸 Demonstração Visual da Interface

<div align="center">
  <img src="docs/screenshots/02-executive-dashboard.png" alt="Dashboard Executivo de Segurança & Health Rating" width="900" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);" />
  <p><em>Dashboard Executivo de Segurança: cálculo de SCA Health Rating em tempo real, métricas de vulnerabilidades e grafo topológico embutido.</em></p>
</div>

<br/>

| 🌐 Grafo Topológico 2D de Dependências | 🌳 Árvore Hierárquica Colapsável (TreeView) |
| :---: | :---: |
| <img src="docs/screenshots/04-dependency-graph.png" alt="Grafo Topológico 2D" width="480" /> | <img src="docs/screenshots/06-tree-view.png" alt="Árvore Hierárquica" width="480" /> |
| *Layout automático Dagre LR com MiniMapa reativo* | *Exploração em profundidade com badges de nível e risco* |

| 📊 Matriz Jurídica & ROI de Remediação | 📦 Explorador de Pacotes & Licenças |
| :---: | :---: |
| <img src="docs/screenshots/03-analytics-remediation.png" alt="Matriz de Licenças e Quick Wins" width="480" /> | <img src="docs/screenshots/07-package-explorer.png" alt="Explorador de Pacotes" width="480" /> |
| *Distribuição de licenças e priorização Quick Wins* | *Filtros instantâneos por tipo, licença e CVEs* |

<details>
  <summary>🔍 <strong>Ver Mais Capturas de Tela (Página Inicial & Modal de Impacto Ancestral)</strong></summary>
  <br/>

  ### Página Inicial Executiva (Privacy-First)
  <div align="center">
    <img src="docs/screenshots/01-landing-page.png" alt="Página Inicial" width="850" />
    <p><em>Ingestão Drag & Drop segura e carregamento de amostras pré-configuradas.</em></p>
  </div>

  ### Modal de Detalhes & Caminho de Inclusão Ancestral
  <div align="center">
    <img src="docs/screenshots/05-package-modal.png" alt="Modal de Detalhes do Pacote" width="750" />
    <p><em>Rastreamento de impacto ancestral raiz-a-folha e recomendação de remediação.</em></p>
  </div>
</details>

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
  - **SCA Security Rating (0–100 & Notas A+ a F)**: Cálculo 1-para-1 direto e transparente com memória de cálculo exibida em popover ao passar o mouse.
  - **Classificação Transparente em 3 Níveis**: 🟢 **Baixo Risco** (>=85), 🟡 **Risco Moderado** (70–84) e 🔴 **Risco Elevado** (<70).
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

## 📐 Fórmula de Pontuação (SCA Health Rating & Memória de Cálculo)

$$\text{Penalidade CVE} = 15 \times \text{Crit} + 6 \times \text{High} + 2 \times \text{Med} + 0.5 \times \text{Low}$$

$$\text{Penalidade Licenças} = 5 \times \text{Copyleft (máx 30)} + 0.05 \times \text{Desconhecida (máx 5)}$$

$$\text{Score Final} = \max\left(0, 100 - (\text{Penalidade CVE} + \text{Penalidade Licenças})\right)$$

| Score | Nota Conceitual | Nível de Risco | Cor |
| :---: | :---: | :---: | :---: |
| 95 – 100 | **A+** | Baixo Risco | 🟢 Verde Emerald |
| 85 – 94 | **A** | Baixo Risco | 🟢 Verde Emerald |
| 75 – 84 | **B+** | Risco Moderado | 🟡 Amarelo Amber / Cyan |
| 65 – 74 | **B** | Risco Moderado | 🟡 Amarelo Amber / Cyan |
| 50 – 64 | **C** | Risco Elevado | 🔴 Vermelho Rose |
| 35 – 49 | **D** | Risco Elevado | 🔴 Vermelho Rose |
| 0 – 34 | **F** | Risco Crítico | 🔴 Vermelho Rose |

---

## 🚀 Executando com Docker (Pronto para Uso)

### 1. Execução Rápida via GHCR (GitHub Container Registry)
Execute a imagem pré-compilada oficial diretamente do GitHub Container Registry:
```bash
docker run -d -p 8080:8080 --name sca-visualizer ghcr.io/brunoez/sca:latest
```
Acesse no seu navegador: **`http://localhost:8080`**

### 2. Iniciar via Docker Compose:
```bash
docker-compose up -d --build
```
Acesse no seu navegador: **`http://localhost:8081`**

### 3. Build da Imagem Manualmente:
```bash
cd frontend
docker build -t ghcr.io/brunoez/sca:latest .
docker run -d -p 8080:80 --name sca-visualizer ghcr.io/brunoez/sca:latest
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
- **17 arquivos de teste**
- **86 testes unitários e de integração E2E** (100% aprovados)

---

## 📜 Historico de Versões & Changelog

Consulte o arquivo [`CHANGELOG.md`](./CHANGELOG.md) para visualizar o histórico de atualizações de cada versão.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](./LICENSE) para mais detalhes.
