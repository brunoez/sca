# 🌐 Guia de Configuração DNS-AID no Cloudflare DNS (DNS for AI Discovery - RFC 9460)

O teste de validação do **DNS-AID** retornou `NXDOMAIN` (Status 3) porque os registros DNS ainda precisam ser adicionados no painel do **Cloudflare DNS** para o seu domínio `brunoizidorio.com.br`.

---

## 🛠️ Passo a Passo para Adicionar no Cloudflare DNS

Acesse o painel do **Cloudflare** -> Selecione `brunoizidorio.com.br` -> **DNS** -> **Records** -> **Add Record**:

### 1️⃣ Registro 1: `_index._agents.sca` (HTTPS)
- **Type**: `HTTPS`
- **Name**: `_index._agents.sca`
- **Priority**: `1`
- **Target**: `sca.brunoizidorio.com.br.`
- **Value / Parameters**: `alpn="h2,h3" port=443 uri="/.well-known/agent-skills/index.json"`
- **TTL**: Auto

### 2️⃣ Registro 2: `_a2a._agents.sca` (HTTPS)
- **Type**: `HTTPS`
- **Name**: `_a2a._agents.sca`
- **Priority**: `1`
- **Target**: `sca.brunoizidorio.com.br.`
- **Value / Parameters**: `alpn="h2,h3" port=443 uri="/.well-known/api-catalog"`
- **TTL**: Auto

### 3️⃣ Registro 3: `_mcp._agents.sca` (HTTPS)
- **Type**: `HTTPS`
- **Name**: `_mcp._agents.sca`
- **Priority**: `1`
- **Target**: `sca.brunoizidorio.com.br.`
- **Value / Parameters**: `alpn="h2,h3" port=443 uri="/.well-known/mcp/server-card.json"`
- **TTL**: Auto

### 4️⃣ Registro 4: `_index._agents.sca` (TXT Fallback)
- **Type**: `TXT`
- **Name**: `_index._agents.sca`
- **Content**: `"v=dnsaid1; uri=https://sca.brunoizidorio.com.br/.well-known/agent-skills/index.json; mcp=https://sca.brunoizidorio.com.br/.well-known/mcp/server-card.json"`
- **TTL**: Auto

---

## 🔐 Habilitação de DNSSEC (Recomendado)

Na aba **DNS > Settings** do Cloudflare:
1. Clique em **Enable DNSSEC**.
2. Adicione a chave `DS` no seu registrador de domínio (`Registro.br`).
