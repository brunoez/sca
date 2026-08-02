# 🛡️ CycloneDX SCA Visualizer & Dependency Tree Platform

![CycloneDX SCA Visualizer](https://img.shields.io/badge/CycloneDX-1.2_to_1.6-cyan.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Build Status](https://img.shields.io/badge/Tests-13_Passed_%7C_67_Tests-emerald.svg)
![Security](https://img.shields.io/badge/Security-100%25_Client--Side_RAM-purple.svg)

> **Inteligência Executiva & Visualizador de Grafo de Supply Chain de Software (CycloneDX JSON & XML)**  
> Aplicação Web 100% Client-Side para análise visual de Software Bill of Materials (SBOM), cálculo de SCA Rating logarítmico, matriz de licenças, árvore hierárquica e grafo 2D de dependências com rastreamento de impacto ancestral.

---

## 🌟 Principais Recursos

- **100% Client-Side & Privacy-First**: Todo o processamento de parsing (JSON/XML), validação e rendering do grafo ocorre na memória RAM do navegador. Nenhum arquivo ou dado é enviado para servidores externos.
- **Dashboard Executivo de Segurança**: SCA Health Score (0–100 & Notas A+ a F), métricas de vulnerabilidades por severidade (Crítico, Alto, Médio, Baixo) e matriz de conformidade jurídica de licenças (Permissivas vs Copyleft).
- **Grafo 2D Interativo de Dependências**: Engine visual construída com `@xyflow/react` e layout hierárquico automatizado via `@dagrejs/dagre`, com destaque de caminho de inclusão (ancestrais) ao clicar em nós transitivos.
- **Árvore Hierárquica Colapsável**: Visão em árvore para navegação profunda em dependências aninhadas.
- **Explorador de Pacotes**: Tabela interativa com busca instantânea, ordenação e filtros por severidade e licença.
- **Quick Wins de Remediação**: Algoritmo que calcula o ROI de remediação identificando dependências diretas com maior impacto downstream.
- **Proteção Anti-XXE & DoS**: Parser XML com DTDs externas estritamente desabilitadas e algoritmo DFS com salvaguarda contra grafos cíclicos.
- **Internacionalização (i18n)**: Suporte bilíngue em tempo real (Português PT-BR e Inglês EN-US).

---

## 🚀 Executando com Docker (Produção)

A aplicação conta com um build de produção otimizado com Nginx slim e suporte a Docker Compose:

### 1. Iniciar com Docker Compose:
```bash
docker-compose up -d --build
```
A aplicação estará disponível em: `http://localhost:8081`

### 2. Construir Imagem Manualmente:
```bash
cd frontend
docker build -t cyclonedx-sca-visualizer:latest .
docker run -d -p 8081:80 --name sca_prod cyclonedx-sca-visualizer:latest
```

---

## 🛠️ Desenvolvimento Local

### Pré-requisitos
- Node.js >= 20.x
- npm >= 10.x

### Passos:
```bash
# Clone o repositório e acesse a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Execute o servidor de desenvolvimento Vite
npm run dev

# Execute a suíte de testes unitários e de integração (Vitest)
npm run test -- --run
```

---

## 🧪 Testes

A suíte de testes cobre parsers, normalizadores, cálculo de pontuação, gerenciamento de estado e navegação E2E:
- `npm run test` (Modo Watch)
- `npm run test -- --run` (Execução única CI/CD)

---

## 📄 Licença

Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
