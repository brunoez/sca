# 🛡️ CycloneDX SCA Visualizer Wiki

> **Bem-vindo à documentação oficial do CycloneDX SCA Visualizer!**

O **CycloneDX SCA Visualizer** é uma plataforma executiva de inteligência em segurança da cadeia de suprimentos de software (*Software Supply Chain Security*). Trata-se de uma aplicação **Single-Page Application (SPA) 100% Client-Side**, projetada para analisar arquivos CycloneDX SBOM (JSON e XML v1.2 a v1.6), calcular a nota de saúde de segurança (*SCA Health Rating*), auditar licenças jurídicas e renderizar o grafo topológico de dependências 2D diretamente na memória RAM do navegador do usuário.

---

## 📚 Índice da Documentação

- [[Home]] - Visão Geral do Projeto e Recursos Principais.
- [[Architecture-and-Data-Flow]] - Arquitetura Privacy-First, Ingestão XML/JSON, Zustand Store e Grafo 2D.
- [[Security-Rating-Calculation]] - Fórmula de Pontuação 1-para-1, Penalidades de CVEs, Licenças e 3 Níveis de Risco.
- [[DevSecOps-and-Deployment]] - Container Não-Root Docker (`USER nginx`), Nginx Hardened, CI/CD de 6 Estágios e Deploy na VPS.
- [[Agent-Readiness-and-WebMCP]] - Protocolos de Descoberta para Agentes de IA (RFC 8288, RFC 9727, MCP Server Card, WebMCP).

---

## 🌟 Destaques do Projeto

- **🔒 100% Client-Side & Privacy-First**: Nenhum arquivo ou dado é enviado para servidores externos.
- **📊 SCA Security Rating Transparente**: Pontuação de 0 a 100 com memória de cálculo interativa exibida em card popover.
- **🕸️ Navegador Topológico 2D**: Layout hierárquico automatizado (Dagre + React Flow) com rastreamento de **Caminho de Impacto** ancestral.
- **⚡ Performance Garantida**: Suporte a SBOMs massivos com indicador visual de processamento em background.
- **🤖 Prontidão para Agentes de IA**: Integração com WebMCP, Cartão de Servidor MCP (SEP-1649) e negociação de conteúdo Markdown.
