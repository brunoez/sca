# 🤖 Agent Readiness & Suporte a WebMCP (v1.6.0)

## 📌 Visão Geral da Prontidão para Agentes

O **CycloneDX SCA Visualizer** é totalmente compatível com os protocolos abertos de descoberta e interação de Agentes de IA (*IsItAgentReady / Agent Skills / WebMCP / RFC 8288 / RFC 9727*).

---

## 🔗 Endpoints de Descoberta Publicados

- **`Sitemap`**: `https://sca.brunoizidorio.com.br/sitemap.xml`
- **`Robots.txt`**: `https://sca.brunoizidorio.com.br/robots.txt`
- **`API Catalog (RFC 9727)`**: `https://sca.brunoizidorio.com.br/.well-known/api-catalog` (`application/linkset+json`)
- **`Agent Skills Index (v0.2.0)`**: `https://sca.brunoizidorio.com.br/.well-known/agent-skills/index.json`
- **`MCP Server Card (SEP-1649)`**: `https://sca.brunoizidorio.com.br/.well-known/mcp/server-card.json`
- **`Agent Registration / Policy`**: `https://sca.brunoizidorio.com.br/auth.md`
- **`Markdown for Agents`**: `https://sca.brunoizidorio.com.br/index.md` e `/llms.txt`

---

## 🛠️ API WebMCP In-Browser (`navigator.modelContext`)

A aplicação expõe ferramentas nativas no navegador via `navigator.modelContext.provideContext()`:

1. `analyze_sbom({ sbomContent, fileName })`:
   - Processa a string bruta do SBOM (JSON/XML) e popula o modelo do SCA.
2. `get_security_score()`:
   - Retorna a nota, nota conceitual, vulnerabilidades e distribuição de licenças.
