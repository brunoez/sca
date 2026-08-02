# 🌐 Guia de Configuração DNS-AID no Cloudflare DNS (Solução do Erro de Validação)

Este guia explica como preencher os registros **HTTPS** no **Cloudflare DNS** sem o erro `"Value for HTTPS record is invalid."`.

---

## 🔍 Por que o Cloudflare mostrou "Value for HTTPS record is invalid"?

O validador da interface do Cloudflare DNS exige parâmetros **RFC 9460 IANA padrão** (`alpn` e `port`). O atributo `uri="..."` é um parâmetro estendido especificado no rascunho do DNS-AID que deve ser incluído no registro **TXT**, enquanto o registro **HTTPS** usa a sintaxe padrão do Cloudflare.

---

## 🛠️ Como preencher no Cloudflare DNS (Valores Válidos)

No painel do **Cloudflare** -> `brunoizidorio.com.br` -> **DNS** -> **Add Record**:

### 1️⃣ Registro 1: `_index._agents.sca` (HTTPS)
- **Type**: `HTTPS`
- **Name**: `_index._agents.sca`
- **Priority**: `1`
- **Target**: `sca.brunoizidorio.com.br.`
- **Value (optional)**: `alpn="h2,h3" port=443` *(ou pode deixar em branco)*
- **TTL**: Auto

### 2️⃣ Registro 2: `_a2a._agents.sca` (HTTPS)
- **Type**: `HTTPS`
- **Name**: `_a2a._agents.sca`
- **Priority**: `1`
- **Target**: `sca.brunoizidorio.com.br.`
- **Value (optional)**: `alpn="h2,h3" port=443` *(ou pode deixar em branco)*
- **TTL**: Auto

### 3️⃣ Registro 3: `_mcp._agents.sca` (HTTPS)
- **Type**: `HTTPS`
- **Name**: `_mcp._agents.sca`
- **Priority**: `1`
- **Target**: `sca.brunoizidorio.com.br.`
- **Value (optional)**: `alpn="h2,h3" port=443` *(ou pode deixar em branco)*
- **TTL**: Auto

### 4️⃣ Registro 4: `_index._agents.sca` (TXT Fallback & URI Metadata)
- **Type**: `TXT`
- **Name**: `_index._agents.sca`
- **Content**: `"v=dnsaid1; uri=https://sca.brunoizidorio.com.br/.well-known/agent-skills/index.json; mcp=https://sca.brunoizidorio.com.br/.well-known/mcp/server-card.json"`
- **TTL**: Auto
