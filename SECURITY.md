# 🔒 Política de Segurança / Security Policy

A segurança e a privacidade dos dados são princípios fundamentais do **CycloneDX SCA Visualizer**.

## 🛡️ Arquitetura Privacy-First & 100% Client-Side
O **CycloneDX SCA Visualizer** opera exclusivamente em memória local (RAM) do navegador do usuário.
- **Nenhum arquivo SBOM**, código-fonte ou metadados de dependências são transmitidos para servidores de nuvem, banco de dados ou terceiros.
- O parsing de XML é protegido contra ataques **Anti-XXE** (`processEntities: false`).
- A renderização do grafo utiliza algoritmos com controle de profundidade e detecção de ciclos para prevenir **Denial of Service (DoS)**.
- Todas as saídas de vulnerabilidades e descrições são sanitizadas rigorosamente via **DOMPurify**.

---

## 📦 Versões Suportadas

Apenas a versão mais recente em produção recebe atualizações ativas de segurança:

| Versão | Suportada |
| :--- | :--- |
| `v1.7.x` | ✅ Sim |
| `< v1.7.0` | ❌ Não |

---

## 🚨 Reportando uma Vulnerabilidade

Se você descobrir uma vulnerabilidade de segurança neste projeto, solicitamos que nos informe de forma responsável:

1. **Não abra uma issue pública** para reportar vulnerabilidades de segurança críticas ou de dia zero.
2. Utilize o recurso oficial do GitHub: **[Report a Security Vulnerability](https://github.com/brunoez/sca/security/advisories/new)** (Security Advisory privado).
3. Alternativamente, envie um e-mail com os detalhes para o mantenedor do projeto com o assunto `[SECURITY VULNERABILITY] CycloneDX SCA Visualizer`.

### O que incluir no seu relatório:
- Descrição detalhada da vulnerabilidade encontrada.
- Prova de Conceito (PoC) com passos claros para reproduzir o problema.
- Arquivo SBOM de teste simulado (sem dados confidenciais de terceiros).
- Impacto potencial estimado.

### Prazo de Resposta:
- Nós responderemos ao seu relatório em até **48 horas**.
- Se a vulnerabilidade for confirmada, publicaremos uma correção e um aviso de segurança (Security Advisory) com os devidos créditos ao pesquisador.

Obrigado por ajudar a manter a comunidade de código aberto segura! 🛡️
