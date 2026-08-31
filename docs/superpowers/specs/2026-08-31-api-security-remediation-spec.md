# 📋 Especificação Técnica: Remediação de APIs, Segurança (OWASP API Top 10) e Resiliência

- **Projeto:** CycloneDX SCA Visualizer & Dependency Tree Platform
- **Versão Alvo:** `v1.7.3`
- **Data:** 31 de Agosto de 2026
- **Status:** 🎯 Pronto para Implementação
- **Metodologia:** Spec-Driven Development (SDD), Behavior-Driven Development (BDD) e Test-Driven Development (TDD)

---

## 1. 🏗️ SDD (Spec-Driven Development): Arquitetura, Contratos e Requisitos

### 1.1 Contexto e Objetivos
A auditoria técnica identificou oportunidades de fortalecimento nas interfaces externas da aplicação, nos endpoints RFC de descoberta de agentes de IA (*Agent Discovery*), na API in-browser WebMCP, na resiliência de chamadas HTTP downstream e na esteira de CI/CD.

Esta especificação define os requisitos formais e o design técnico para solucionar os 5 pontos prioritários:
1. **API-01 (Alta):** Eliminar a quebra de contrato e MIME type mismatch nos endpoints RFC `/.well-known/` através da criação dos arquivos estáticos JSON correspondentes e ajuste de roteamento no Nginx.
2. **API-02 (Alta):** Implementar trava de tamanho de payload (máximo 50MB) e tratamento estruturado de erro na API WebMCP in-browser (`analyze_sbom`).
3. **API-03 (Média):** Configurar timeout resiliente de 5 segundos (`AbortSignal.timeout(5000)`) nas requisições downstream de amostras em `SampleLoader.tsx`.
4. **API-04 (Média):** Endurecer os portões de DevSecOps no GitLab CI/CD, removendo `allow_failure: true` dos scanners de SAST (`semgrep_sast_scan`) e de container (`trivy_container_scan`).
5. **API-05 (Baixa):** Configurar zonas de Rate Limiting e controle de rajadas (*burst*) no Nginx para proteção contra scraping abusivo.

---

### 1.2 Matriz de Rastreabilidade e Requisitos de Segurança

| ID Requisito | Categoria OWASP API | Componente / Arquivo Alvo | Descrição Técnica da Mudança | Critério de Aceite |
| :--- | :--- | :--- | :--- | :--- |
| **REQ-API-01** | API8:2023 Security Misconfig / Contratos | `frontend/public/.well-known/*` & `frontend/nginx.conf` | Criar arquivos JSON reais para `oauth-protected-resource`, `oauth-authorization-server`, `api-catalog`, `agent-skills` e `mcp`. No Nginx, configurar `try_files $uri =404;`. | Requisições HTTP GET retornam `200 OK` com `Content-Type: application/json` e payload JSON válido (zero HTML do SPA retornado). |
| **REQ-API-02** | API4:2023 Unrestricted Resource Consumption | `frontend/src/utils/webMcp.ts` | Adicionar validação `content.length <= 50 * 1024 * 1024` no handler `execute` da tool `analyze_sbom` com retorno de erro `{ success: false, error: '...' }`. | Payloads >50MB são rejeitados instantaneamente sem travar a thread do navegador e retornam objeto de erro claro. |
| **REQ-API-03** | API / Resiliência Downstream | `frontend/src/components/landing/SampleLoader.tsx` | Adicionar `{ signal: AbortSignal.timeout(5000) }` na chamada `fetch(samplePath)`. | Requisições lentas ou offline são abortadas em 5s e acionam o fallback embutido imediatamente. |
| **REQ-API-04** | API / CI/CD Quality Gates | `.gitlab/ci/security.gitlab-ci.yml` | Remover `allow_failure: true` de `semgrep_sast_scan` e `trivy_container_scan`. | O pipeline falha e bloqueia deploy em caso de vulnerabilidades severas detectadas. |
| **REQ-API-05** | API4:2023 Rate Limiting / DoS Gateway | `frontend/nginx.conf` | Definir `limit_req_zone $binary_remote_addr zone=sca_rate:10m rate=30r/s;` e aplicar `limit_req zone=sca_rate burst=60 nodelay;`. | Rajadas excessivas recebem `HTTP 429 Too Many Requests` de forma controlada. |

---

## 2. 🥒 BDD (Behavior-Driven Development): Cenários Executáveis em Gherkin

### 2.1 Feature: Conformidade de Contrato em Endpoints RFC e Descoberta de Agentes
```gherkin
@api @rfc @discovery @contracts
Feature: Conformidade de Contrato e Tipagem MIME em Endpoints RFC /.well-known/
  As an Agente Autônomo de IA ou Cliente HTTP
  I want Consultar os metadados de autenticação e catálogo de APIs em /.well-known/
  So that Eu possa consumir a especificação de serviços sem falhas de parsing JSON

  Background:
    Given o servidor Nginx está ativo e servindo a aplicação

  Scenario: Consulta ao endpoint de recurso protegido OAuth
    When o cliente envia uma requisição "GET /.well-known/oauth-protected-resource" com header "Accept: application/json"
    Then o status da resposta deve ser 200
    And o header "Content-Type" deve conter "application/json"
    And o corpo da resposta deve ser um JSON válido contendo a chave "resource" com valor "https://sca.brunoizidorio.com.br"
    And o corpo da resposta NÃO deve conter tags HTML como "<!DOCTYPE html>"

  Scenario: Consulta ao endpoint de servidor de autorização OAuth
    When o cliente envia uma requisição "GET /.well-known/oauth-authorization-server" com header "Accept: application/json"
    Then o status da resposta deve ser 200
    And o header "Content-Type" deve conter "application/json"
    And o corpo da resposta deve ser um JSON válido contendo a chave "issuer"
    And o corpo da resposta NÃO deve conter tags HTML

  Scenario: Consulta a um endpoint .well-known inexistente
    When o cliente envia uma requisição "GET /.well-known/recurso-inexistente.json"
    Then o status da resposta deve ser 404
    And a resposta NÃO deve redirecionar para o index.html com status 200
```

---

### 2.2 Feature: Proteção de Payload e Negação de Serviço na API WebMCP
```gherkin
@api @webmcp @dos @payload
Feature: Proteção contra Consumo Desenfreado de Memória na API WebMCP In-Browser
  As a Navegador do Usuário
  I want Que a ferramenta analyze_sbom rejeite strings de SBOM excessivamente gigantes
  So that Minha memória RAM não seja esgotada por chamadas de API desproporcionais

  Background:
    Given a ferramenta WebMCP "analyze_sbom" foi registrada em "navigator.modelContext"

  Scenario: Rejeição de payload WebMCP acima de 50MB
    Given um payload de SBOM contendo 52MB de caracteres
    When o agente executa a ferramenta "analyze_sbom" com esse payload
    Then a execução deve retornar um objeto com "success" igual a falso
    And a mensagem de erro deve conter "Payload excede o limite máximo permitido de 50MB"
    And o estado da central ScaStore não deve ser corrompido

  Scenario: Processamento bem-sucedido de payload WebMCP válido
    Given um payload de SBOM JSON válido de 500KB
    When o agente executa a ferramenta "analyze_sbom" com esse payload
    Then a execução deve retornar "success" igual a verdadeiro
    And o objeto de retorno deve conter "componentName", "totalComponents", "score" e "grade"
    And a central ScaStore deve ser populada com o modelo normalizado
```

---

### 2.3 Feature: Resiliência e Timeout em Requisições Downstream
```gherkin
@api @resilience @timeout @sample
Feature: Resiliência em Chamadas Downstream de Amostras de SBOM
  As a Usuário na Landing Page
  I want Que o carregamento de exemplos pré-configurados não congele em conexões lentas
  So that Eu tenha uma experiência fluida mesmo offline ou com instabilidade de rede

  Scenario: Fallback imediato após timeout de 5 segundos
    Given o usuário clica no botão para carregar a amostra "OWASP Juice Shop"
    And a requisição HTTP "fetch(/samples/juice-shop-cyclonedx.json)" excede o tempo limite de 5 segundos
    When o AbortSignal de timeout é disparado
    Then a requisição deve ser cancelada automaticamente
    And o conteúdo embutido de fallback deve ser carregado no visualizador
    And o modelo SCA deve ser renderizado no dashboard sem erro bloqueante
```

---

### 2.4 Feature: Portões de Qualidade e DevSecOps Bloqueantes no CI/CD
```gherkin
@devsecops @ci @security_gates
Feature: Portões de Qualidade e Bloqueio de CI/CD para Vulnerabilidades SAST e Containers
  As a Responsável por Segurança de Software
  I want Que a esteira de CI/CD aborte o pipeline caso vulnerabilidades críticas sejam introduzidas
  So that Nenhuma versão vulnerável seja implantada no servidor de produção

  Scenario: Bloqueio do pipeline por falha no Semgrep SAST
    Given uma alteração de código introduz uma vulnerabilidade detectada pelo Semgrep
    When o job "semgrep_sast_scan" executa na esteira
    Then o job deve falhar e interromper o pipeline
    And os estágios "docker-build" e "deploy" não devem ser executados

  Scenario: Bloqueio do pipeline por vulnerabilidade crítica na Imagem Docker
    Given a imagem Docker contém uma CVE de severidade CRITICAL no Nginx Alpine
    When o job "trivy_container_scan" executa na esteira
    Then o job deve falhar e impedir o deploy de produção
```

---

## 3. 🧪 TDD (Test-Driven Development) & Estratégia de Testes

### 3.1 Plano de Testes Unitários e de Integração (Vitest)

1. **Testes Unitários para WebMCP (`frontend/src/utils/__tests__/webMcp.test.ts`):**
   - Testar o registro correto das ferramentas `analyze_sbom` e `get_security_score`.
   - Testar rejeição de string com tamanho > 50MB retornando `{ success: false, error: ... }`.
   - Testar processamento de SBOM válido e mutação correta do store Zustand.
   - Testar tratamento de erro gracioso para JSON/XML malformado sem lançar exceção não tratada.

2. **Testes para `SampleLoader` (`frontend/src/components/landing/__tests__/SampleLoader.test.tsx`):**
   - Testar passagem de `signal: AbortSignal.timeout(5000)` no `fetch`.
   - Testar que a rejeição por timeout aciona o fallback embutido e popula o store com sucesso.

3. **Testes de Roteamento Estático Nginx e Arquivos `.well-known`:**
   - Validar sintaxe com `nginx -t`.
   - Validar existência e integridade dos arquivos JSON criados em `public/.well-known/`.

---

## 4. 🚀 Plano de Execução Passo a Passo (Sem Overkill)

1. **Passo 1 (Arquivos RFC & Contratos):**
   - Criar diretório `frontend/public/.well-known/` com:
     - `oauth-protected-resource` (JSON)
     - `oauth-authorization-server` (JSON)
     - `api-catalog` (linkset+json)
     - `agent-skills/index.json` (JSON)
     - `mcp/server-card.json` (JSON)
   - Atualizar `frontend/nginx.conf` com roteamento estrito e `try_files $uri =404;`.

2. **Passo 2 (WebMCP Payload Guard):**
   - Atualizar `frontend/src/utils/webMcp.ts` com validação de limite de 50MB e tratamento estruturado de erro.
   - Criar suíte de testes `frontend/src/utils/__tests__/webMcp.test.ts`.

3. **Passo 3 (Timeout Downstream):**
   - Atualizar `frontend/src/components/landing/SampleLoader.tsx` com `AbortSignal.timeout(5000)`.

4. **Passo 4 (CI/CD Gates):**
   - Atualizar `.gitlab/ci/security.gitlab-ci.yml` removendo `allow_failure: true` de `semgrep_sast_scan` e `trivy_container_scan`.

5. **Passo 5 (Rate Limiting no Nginx):**
   - Configurar `limit_req_zone` no `frontend/nginx.conf`.

6. **Passo 6 (Verificação & Testes):**
   - Executar `npm test -- --run` para garantir 100% dos testes aprovados.
