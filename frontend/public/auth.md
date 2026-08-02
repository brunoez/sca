# Auth.md - AI Agent Registration & Authentication Policy

## 🛡️ Authentication Model: 100% Client-Side (Zero Auth Required)

The **CycloneDX SCA Visualizer** is a 100% Client-Side Single Page Application (SPA).

- **No API Keys Required**: All parsing, graph normalizations, vulnerability rating calculations, and license compliance audits run locally inside the client browser RAM.
- **Zero Data Persistence**: No SBOM files, user data, or source code are ever uploaded or transmitted to any server.
- **Agent Access**: AI Agents may interact with the application directly via standard WebMCP browser APIs (`navigator.modelContext.provideContext()`) or client-side JSON/XML parsing without needing authentication headers or registration credentials.

## 🔗 Discovery Resources

- **API Catalog**: `https://sca.brunoizidorio.com.br/.well-known/api-catalog`
- **Agent Skills Index**: `https://sca.brunoizidorio.com.br/.well-known/agent-skills/index.json`
- **MCP Server Card**: `https://sca.brunoizidorio.com.br/.well-known/mcp/server-card.json`
- **OAuth Protected Resource Metadata**: `https://sca.brunoizidorio.com.br/.well-known/oauth-protected-resource`
