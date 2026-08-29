# 📋 Especificação Técnica de Remediação de Segurança (SDD + BDD)
**Projeto:** CycloneDX SCA Visualizer & Dependency Tree Platform  
**Data:** 2026-08-29  
**Status:** Aprovado para Implementação  
**Metodologia:** Spec-Driven Development (SDD), Behavior-Driven Development (BDD) e Test-Driven Development (TDD)

---

## 1. 🏗️ SDD (Spec-Driven Development): Arquitetura e Requisitos

### 1.1 Contexto e Objetivos
Esta especificação estabelece as correções técnicas para os 4 achados de segurança identificados na auditoria de código:
1. **SEC-01 (Média):** Eliminar o uso desnecessário de `dangerouslySetInnerHTML` em metadados de pacotes (`component.group`) e restringir os atributos permitidos na sanitização DOMPurify em descrições de vulnerabilidades.
2. **SEC-02 (Média):** Endurecer a esteira de DevSecOps no GitLab CI removendo `allow_failure: true` do scanner de segredos (Gitleaks).
3. **SEC-03 (Baixa):** Fortalecer o cabeçalho `Content-Security-Policy` no Nginx.
4. **SEC-04 (Info):** Proteger o frontend contra DoS client-side através de trava de tamanho máximo de arquivo (50MB) no Dropzone.

### 1.2 Matriz de Requisitos Funcionais e de Segurança

| ID | Requisito de Segurança | Componente Alvo | Critério de Aceite |
| :--- | :--- | :--- | :--- |
| **REQ-SEC-01** | Renderização segura de metadados sem HTML | `PackageDetailModal.tsx` | `component.group` é exibido como texto JSX puro. `sanitizeText` bloqueia atributos perigosos e aplica sanitização estrita. |
| **REQ-SEC-02** | Bloqueio de Pipeline por Segredos | `.gitlab/ci/security.gitlab-ci.yml` | `gitleaks_secret_scan` falha e interrompe a esteira em caso de segredos detectados (`allow_failure: false`). |
| **REQ-SEC-03** | Endurecimento de CSP HTTP | `nginx.conf` | CSP robusto aplicando proteções modernas sem relaxamentos desnecessários. |
| **REQ-SEC-04** | Proteção anti-DoS por Payload Excessivo | `Dropzone.tsx` | Arquivos > 50MB são rejeitados antes do `FileReader`, emitindo mensagem de erro amigável. |

---

## 2. 🥒 BDD (Behavior-Driven Development): Cenários Executáveis em Gherkin

```gherkin
@security @modal @xss
Feature: Renderização Segura de Metadados de Pacotes e Prevenção de XSS
  As a Analista de Segurança
  I want Visualizar detalhes de pacotes e vulnerabilidades de forma segura
  So that Entradas maliciosas em SBOMs não causem injeção de código ou phishing visual

  Scenario: Renderização puramente textual de grupo de pacote sem HTML
    Given um SBOM contendo um componente com grupo "<script>alert(1)</script>org.apache"
    When o usuário abre o modal de detalhes do pacote
    Then o texto do grupo deve ser exibido literalmente sem interpretação HTML
    And nenhuma tag script deve ser executada no DOM

  Scenario: Sanitização estrita de descrições e recomendações de CVEs
    Given um componente com vulnerabilidade contendo descrição "<img src=x onerror=alert(1)><b>Buffer Overflow</b><a href='javascript:void(0)'>link</a>"
    When o modal de detalhes do pacote é renderizado
    Then a tag perigosa "img" com handler "onerror" deve ser removida pelo DOMPurify
    And o texto seguro "<b>Buffer Overflow</b>" deve ser preservado
    And links com esquemas inseguros não devem ser permitidos

@security @upload @dos
Feature: Limitação de Tamanho de Payload no Upload de SBOM (Anti-DoS)
  As a Usuário da Plataforma SCA
  I want Ser avisado se um arquivo SBOM for excessivamente pesado
  So that O navegador não congele por exaustão de memória RAM

  Scenario: Rejeição de arquivo SBOM acima de 50MB
    Given o usuário seleciona um arquivo "huge_sbom.json" com tamanho de 55MB
    When o arquivo é recebido pelo Dropzone
    Then o arquivo deve ser rejeitado imediatamente antes da leitura pelo FileReader
    And uma mensagem de erro "O arquivo selecionado excede o limite máximo permitido de 50MB." deve ser exibida
    And o modelo do SBOM no estado global deve permanecer nulo

  Scenario: Aceite de arquivo SBOM válido dentro do limite
    Given o usuário seleciona um arquivo "valid_sbom.json" com tamanho de 2MB
    When o arquivo é recebido pelo Dropzone
    Then o arquivo deve ser lido e normalizado com sucesso
    And a mensagem de sucesso deve ser exibida

@security @ci @secrets
Feature: Bloqueio de CI/CD para Prevenção de Vazamento de Segredos
  As a Engenheiro de DevSecOps
  I want Que a esteira de CI/CD aborte o deploy se segredos forem commitados
  So that Chaves e senhas não vazem para produção

  Scenario: Gitleaks bloqueia o pipeline
    Given um commit contendo uma credencial não autorizada
    When o job "gitleaks_secret_scan" executa na esteira
    Then o job deve falhar com código diferente de zero
    And a esteira deve ser interrompida sem prosseguir para os estágios de "docker-build" e "deploy"
```

---

## 3. 🧪 TDD (Test-Driven Development): Plano de Testes Unitários

1. **Testes Unitários para `PackageDetailModal`:**
   - Criar arquivo de teste dedicado `frontend/src/components/explorer/__tests__/PackageDetailModal.test.tsx`.
   - Testar que `component.group` com tags HTML renderiza o texto puro e não cria elementos HTML.
   - Testar que a descrição de vulnerabilidades é sanitizada com DOMPurify e remove tags/atributos perigosos.
2. **Testes Unitários para `Dropzone`:**
   - Adicionar teste em `frontend/src/components/landing/__tests__/Dropzone.test.tsx` enviando arquivo simulado com `size > 50 * 1024 * 1024` e verificar mensagem de erro e bloqueio de leitura.
3. **Validação de CI/CD:**
   - Validar sintaxe YAML de `.gitlab/ci/security.gitlab-ci.yml`.
4. **Validação de Nginx:**
   - Validar sintaxe de `frontend/nginx.conf`.
