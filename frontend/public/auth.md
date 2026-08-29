# Auth.md - AI Agent Registration & Authentication Policy

## Agent Auth Registration Flow
This site supports self-contained anonymous registration for AI agents.

### Registration Parameters
- **Type**: Anonymous
- **Skill**: https://sca.brunoizidorio.com.br/auth.md
- **Register URI**: https://sca.brunoizidorio.com.br/auth.md
- **Authentication**: None required (100% Client-Side Browser RAM)

## Registration
- **Registration Type**: Anonymous / None
- **Registration URL**: https://sca.brunoizidorio.com.br/auth.md
- **Client ID**: None Required
- **Supported Identity Types**: anonymous, agent
- **Credential Types**: none

## Authentication
- **Authentication Type**: None (100% Client-Side RAM Analysis)
- **Token Endpoint**: https://sca.brunoizidorio.com.br/
- **Grant Types**: implicit
- **Scopes Supported**: read:sbom, analyze:sbom

## OAuth Metadata
- **Protected Resource Metadata**: https://sca.brunoizidorio.com.br/.well-known/oauth-protected-resource
- **Authorization Server Metadata**: https://sca.brunoizidorio.com.br/.well-known/oauth-authorization-server
- **OpenID Configuration**: https://sca.brunoizidorio.com.br/.well-known/openid-configuration

## Standalone Agent Registration Flow
1. **Zero Registration Steps**: Agents do not need to perform OAuth client registration, API key creation, or header signing.
2. **Direct In-Browser Tools**: Agents can immediately parse CycloneDX SBOMs via standard WebMCP browser APIs (`navigator.modelContext.provideContext()`) or via local RAM parsing.
3. **Data Privacy Guarantee**: 100% of processing remains in local client browser memory; no data is ever persisted or transmitted.
