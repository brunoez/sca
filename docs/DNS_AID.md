# 🌐 Guia de Configuração DNS-AID (DNS for AI Discovery - RFC 9460)

Este documento descreve como configurar os registros DNS **DNS-AID** (DNS for AI Discovery) no Cloudflare DNS para permitir a descoberta de Agentes de IA via resolução de nomes para o domínio `sca.brunoizidorio.com.br`.

---

## 📌 O que é DNS-AID?

O **DNS-AID** utiliza registros **HTTPS / SVCB** (RFC 9460) e registros **TXT** publicados sob a sub-zona `_agents` para apontar agentes de IA aos catálogos de habilidades (`/.well-known/agent-skills/index.json`) e ao servidor MCP (`/.well-known/mcp/server-card.json`).

---

## 🛠️ Registros DNS para adicionar no Cloudflare (ou Provedor DNS)

Acesse o painel do seu provedor DNS (**Cloudflare**) para o domínio `brunoizidorio.com.br` e adicione os seguintes registros:

### 1. Registro de Descoberta de Índice de Skills (`_index._agents.sca`)

| Tipo | Nome | Alvo / Valor | Parâmetros / Configuração |
| :--- | :--- | :--- | :--- |
| **HTTPS** | `_index._agents.sca` | `sca.brunoizidorio.com.br.` | Priority: `1`, `alpn="h2,h3" port=443` |
| **TXT** | `_index._agents.sca` | `"v=dnsaid1; uri=https://sca.brunoizidorio.com.br/.well-known/agent-skills/index.json; mcp=https://sca.brunoizidorio.com.br/.well-known/mcp/server-card.json"` | TTL: Auto |

### 2. Registro de Comunicação Agente-para-Agente (`_a2a._agents.sca`)

| Tipo | Nome | Alvo / Valor | Parâmetros / Configuração |
| :--- | :--- | :--- | :--- |
| **HTTPS** | `_a2a._agents.sca` | `sca.brunoizidorio.com.br.` | Priority: `1`, `alpn="h2,h3" port=443` |
| **TXT** | `_a2a._agents.sca` | `"v=dnsaid1; uri=https://sca.brunoizidorio.com.br/.well-known/api-catalog"` | TTL: Auto |

---

## 🔐 Habilitação de DNSSEC (Obrigatório para Validação Autenticada)

Na aba **DNS > Settings** do Cloudflare:
1. Clique em **Enable DNSSEC**.
2. Copie os registros `DS` fornecidos pelo Cloudflare e adicione no painel do seu registrador de domínio (`Registro.br`).
3. Com o DNSSEC ativo, os resolvers validadores retornarão dados autenticados com o flag `AD` (*Authenticated Data*).
