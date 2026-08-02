# 📜 Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.7.0] - 2026-08-02

### 📱 Suporte Completo a PWA (Progressive Web App - "Abrir no App" / "Instalar App")
- **Web App Manifest & Service Worker**:
  - Criado o arquivo [`frontend/public/manifest.json`](file:///home/bruno/Projetos/sca/frontend/public/manifest.json) com ícones responsivos, atalhos, modo `standalone` e tema visual.
  - Implementado o Service Worker em [`frontend/public/sw.js`](file:///home/bruno/Projetos/sca/frontend/public/sw.js) para suporte offline e instalabilidade nativa em navegadores (Google Chrome, Microsoft Edge, Brave, Opera).
- **Botão de Instalação no Header & Metadados PWA**:
  - Adicionado o botão "Instalar App" no cabeçalho superior ([`App.tsx`](file:///home/bruno/Projetos/sca/frontend/src/App.tsx)) acionado automaticamente via evento `beforeinstallprompt`.
  - Configurados os headers Nginx específicos para `/manifest.json` (`application/manifest+json`) e `/sw.js` (`application/javascript` com `Service-Worker-Allowed`).

---

## [1.6.15] - 2026-08-02

### 🤖 Adição da Chave `skill` em `agent_auth` & Marcadores Standalone em `auth.md`
- **Inclusão da Propriedade `skill` no OAuth Authorization Server Metadata**:
  - Adicionado a chave `"skill": "https://sca.brunoizidorio.com.br/auth.md"` ao bloco `agent_auth` nos arquivos `/.well-known/oauth-authorization-server` e `.json`, resolvendo a validação `Validate agent_auth.skill`.
- **Inclusão de Marcadores de Fluxo de Registro Standalone no `auth.md`**:
  - Atualizado [`auth.md`](file:///home/bruno/Projetos/sca/frontend/public/auth.md) com o bloco `## Agent Auth Registration Flow` para satisfazer o validador de fluxo autônomo.

---

## [1.6.14] - 2026-08-02

### 🌐 Confirmação do Cadastro DS no Registro.br
- **Validação das Chaves Keytag e Digest no Registro.br**:
  - Confirmado o preenchimento exato dos campos `Keytag 1` (`2371`) e `Digest 1` (`5F9136...`) na interface de servidores DNS do Registro.br para ativação do DNSSEC e resposta `AD=true`.
  - Atualizado [`docs/DNS_AID.md`](file:///home/bruno/Projetos/sca/docs/DNS_AID.md).

---

## [1.6.13] - 2026-08-02

### 🌐 Esclarecimento da Inserção de Chaves DS no Registro.br
- **Orientações para o Erro "DS record must have a corresponding NS record"**:
  - Atualizado [`docs/DNS_AID.md`](file:///home/bruno/Projetos/sca/docs/DNS_AID.md) para instruir o usuário a **não** tentar cadastrar o registro DS dentro da própria tabela do Cloudflare, mas sim colar as 4 chaves geradas pelo Cloudflare (`Key Tag`, `Algorithm`, `Digest Type`, `Digest`) no painel do registrador de domínio (**Registro.br**).

---

## [1.6.12] - 2026-08-02

### 🌐 Guia de Ativação do DNSSEC para Validação DNS-AID (Flag AD=true)
- **Documentação de Vinculação de Chave DS (Registro.br & Cloudflare)**:
  - Adicionado o tutorial passo a passo em [`docs/DNS_AID.md`](file:///home/bruno/Projetos/sca/docs/DNS_AID.md) para exportação de chaves DS do Cloudflare e inserção no registrador de domínio (`Registro.br`) para habilitação da resposta autenticada `AD=true` exigida na especificação DNS-AID.

---

## [1.6.11] - 2026-08-02

### 🤖 Correção dos Metadados RFC 8414 / RFC 9727 & Formato WorkOS Auth.md
- **Ajuste do Campo `authorization_servers` no OAuth Protected Resource**:
  - Corrigida a lista `authorization_servers` no arquivo `/.well-known/oauth-protected-resource` para usar o Issuer URL base (`"https://sca.brunoizidorio.com.br"`), resolvendo o erro de concatenação de rotas (`.../.well-known/oauth-authorization-server/...`).
- **Formatação de Marcadores Standalone no `auth.md`**:
  - Atualizado [`auth.md`](file:///home/bruno/Projetos/sca/frontend/public/auth.md) com as seções padronizadas da especificação WorkOS (`## Registration`, `## Authentication`, `## OAuth Metadata`, `## Standalone Agent Registration Flow`).
- **Resolução Flexível de URLs no Nginx**:
  - Adicionado suporte a expressões regulares no Nginx para prevenir erros 404 em consultas com caracteres URL-encoded (%60) ou sub-rotas duplicadas em validadores de agentes.

---

## [1.6.10] - 2026-08-02

### 🌐 Ajuste da Sintaxe de Registros HTTPS no Cloudflare DNS
- **Remediação do Erro "Value for HTTPS record is invalid"**:
  - Ajustada a sintaxe do campo `Value` nos registros de tipo `HTTPS` no Cloudflare DNS para `alpn="h2,h3" port=443` (parâmetros IANA RFC 9460 aceitos pelo validador do Cloudflare).
  - Atualizada a documentação em [`docs/DNS_AID.md`](file:///home/bruno/Projetos/sca/docs/DNS_AID.md).

---

## [1.6.9] - 2026-08-02

### 🌐 Atualização do Guia de Registros DNS-AID para Cloudflare DNS
- **Adicionadas Instruções para Solução do `NXDOMAIN` (Status 3)**:
  - Adicionados parâmetros de cadastro detalhado para os 3 pontos de entrada DNS-AID: `_index._agents.sca`, `_a2a._agents.sca` e `_mcp._agents.sca` em registros do tipo `HTTPS` e `TXT` no Cloudflare DNS.

---

## [1.6.8] - 2026-08-02

### 🌐 Especificação de Descoberta DNS-AID (DNS for AI Discovery - RFC 9460)
- **Documentação de Registros DNS-AID & DNSSEC**:
  - Criado o documento [`docs/DNS_AID.md`](file:///home/bruno/Projetos/sca/docs/DNS_AID.md) detalhando as configurações de registros `HTTPS` e `TXT` sob os sub-domínios `_index._agents.sca` e `_a2a._agents.sca` para Cloudflare DNS / BIND.
  - Atualizada a página de Wiki do GitLab [`wiki/Agent-Readiness-and-WebMCP.md`](file:///home/bruno/Projetos/sca/wiki/Agent-Readiness-and-WebMCP.md) com os parâmetros de validação autenticada via DNSSEC.

---

## [1.6.7] - 2026-08-02

### 🛡️ Remediação Avançada de Segurança HTTP (CSP Clean & Cross-Origin Isolation)
- **Remoção de `'unsafe-inline'` em `script-src` na CSP**:
  - Removido `'unsafe-inline'` da diretiva `script-src` na Content-Security-Policy do Nginx, eliminando alertas de vulnerabilidade de injeção de script.
- **Implementação de Cabeçalhos Avançados de Isolamento de Origem**:
  - `Cross-Origin-Opener-Policy` (COOP): `same-origin`
  - `Cross-Origin-Embedder-Policy` (COEP): `credentialless`
  - `Cross-Origin-Resource-Policy` (CORP): `same-origin` para a aplicação SPA e `cross-origin` para endpoints `.well-known`, `/auth.md`, `/index.md` e `/llms.txt`.

---

## [1.6.6] - 2026-08-02

### 🛡️ Endurecimento Completo de Cabeçalhos de Segurança HTTP (OWASP & HSTS)
- **Implementação do Conjunto Completo de Security Headers no Nginx**:
  - `Strict-Transport-Security` (HSTS): `max-age=31536000; includeSubDomains`
  - `Permissions-Policy`: `camera=(), microphone=(), geolocation=(), payment=(), usb=(), display-capture=()`
  - `Content-Security-Policy` (CSP) endurecido contra ataques XSS e injeções de script.
  - `X-Frame-Options: DENY` (Proteção total contra Clickjacking).
  - `X-Content-Type-Options: nosniff` (Prevenção de MIME-sniffing).
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - Injeção obrigatória dos 7 cabeçalhos em **todos** os blocos de rotas e arquivos estáticos do Nginx.

---

## [1.6.5] - 2026-08-02

### 🐛 Corrigido - Herança de Cabeçalhos HTTP Link (RFC 8288) no Nginx
- **Emissão Garantida do Cabeçalho `Link` na Página Inicial (`GET /`)**:
  - Corrigido o comportamento do Nginx onde diretivas `add_header` em blocos de `location` (como `location /`) sobrescreviam todos os cabeçalhos definidos no nível do bloco `server`.
  - Incluída a injeção explícita de cabeçalhos de segurança (OWASP) e do cabeçalho `Link` em todos os blocos de localização (`location /`, `location = /index.md`, `location = /.well-known/...`), garantindo conformidade com a especificação RFC 8288 e ferramentas de validação como *IsItAgentReady*.

---

## [1.6.4] - 2026-08-02

### ✨ Adicionado - Negociação de Conteúdo Markdown for Agents (Cloudflare & RFC)
- **Suporte a `Accept: text/markdown` no Nginx**:
  - Implementada reescrita inteligente no Nginx baseada no cabeçalho HTTP `Accept: text/markdown` para redirecionar requisições de agentes de IA diretamente para `/index.md`.
  - Adicionados cabeçalhos de resposta `Content-Type: text/markdown; charset=utf-8`, `Vary: Accept`, `x-markdown-tokens: 450` e `Access-Control-Allow-Origin: *`.

---

## [1.6.3] - 2026-08-02

### 🤖 Conforme especificações de Descoberta de Agentes (Auth.md & RFC 9728)
- **Metadados Completos do OAuth Protected Resource & Auth Server**:
  - Atualizado `/.well-known/oauth-protected-resource` com `bearer_methods_supported`, `resource_documentation` e `authorization_servers`.
  - Atualizado `/.well-known/oauth-authorization-server` com o bloco completo `agent_auth` (`register_uri`, `supported_identity_types`, `credential_types`, `claim_uri`, `revocation_uri`).
  - Adicionados arquivos de alias `.json` para compatibilidade total com clientes RFC 9728.
  - Adicionados blocos de localização Nginx explícitos para servir os endpoints `.well-known` com `Content-Type: application/json; charset=utf-8` e `Access-Control-Allow-Origin: *`.

---

## [1.6.2] - 2026-08-02

### 🛠️ CI/CD & DevSecOps
- **Estabilização da Publicação de Imagens Docker no GitLab Container Registry**:
  - Migrado o job `docker-build` para `docker buildx build --push` nativo com `docker buildx create --use`.
  - Eliminado o erro `blob unknown to registry` durante o push assíncrono de camadas em pipelines de integração contínua.
  - Adicionada automação de criação e push de Git Tags (`v1.6.2`).

---

## [1.6.1] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Correção da Tipagem TypeScript no Módulo WebMCP (`webMcp.ts`)**:
  - Corrigidas as referências de propriedades do modelo `ScaSbomModel` de `model.score` / `model.stats` para `model.summary` (`scaHealthScore`, `securityGrade`, `totalComponents`, `vulnerabilityCounts`, `licenseBreakdown`).
  - Garantida a compilação limpa do TypeScript (`tsc && vite build`) no estágio `build` da pipeline do GitLab.

---

## [1.6.0] - 2026-08-02

### ✨ Adicionado - Suporte Completo a Agentes de IA (Agent Readiness & WebMCP)
- **Descoberta Automática de Sitemap & Robots.txt**:
  - Adicionado `sitemap.xml` apontando para a URL canônica `https://sca.brunoizidorio.com.br/`.
  - Adicionado `robots.txt` permitindo agentes de IA com referência explícita ao `sitemap.xml`.
- **Cabeçalhos de Resposta de Descoberta (RFC 8288 & RFC 9727)**:
  - Injeção de cabeçalhos `Link` no Nginx e tags `<link>` no HTML para descoberta automática de `api-catalog`, `agent-skills`, `mcp-server-card` e `auth.md`.
- **Catálogo de APIs RFC 9727 (`/.well-known/api-catalog`)**:
  - Endpoint publicado com o tipo de mídia `application/linkset+json`.
- **Descoberta de Autenticação & Registro (`/auth.md` & `/.well-known/oauth-protected-resource`)**:
  - Documentação `/auth.md` e metadados `.well-known` especificando que a aplicação é 100% Client-Side no navegador (Zero Auth / Zero Persistência de Dados).
- **Cartão de Servidor MCP - SEP-1649 (`/.well-known/mcp/server-card.json`)**:
  - Metadados do servidor MCP indicando capacidades do visualizador SCA para agentes.
- **Índice de Skills de Agentes v0.2.0 (`/.well-known/agent-skills/index.json`)**:
  - Publicação do índice de habilidades para descoberta por agentes de IA.
- **Negociação de Conteúdo Markdown (`/index.md` & `/llms.txt`)**:
  - Versão em Markdown otimizada para modelos de linguagem.
- **API WebMCP no Navegador (`navigator.modelContext.provideContext()`)**:
  - Registro de ferramentas in-browser (`analyze_sbom`, `get_security_score`) para interação direta de agentes de IA através do navegador.

---

## [1.5.2] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Ajuste de Direção do Card Popover de Memória de Cálculo (`ScorePopoverCard`)**:
  - Reconfigurada a direção de abertura do card popover para abrir para baixo (`top-full mt-2`), evitando qualquer sobreposição/corte causado pelo cabeçalho global fixo (*sticky top header* `z-40`).
  - Mantida a prioridade de camada `z-30` no `ExecutiveScoreCard` e `z-50` no popover para garantir que o card flutue por cima das seções inferiores sem sofrer recortes.

---

## [1.5.1] - 2026-08-02

### 🎨 Ajustado (Refactored)
- **Seletor de Idioma em Formato Segmentado (Pill Toggle)**:
  - Redesenhado o seletor de idiomas no cabeçalho global (`App.tsx`) para o formato de botão segmentado (*pill container*) com bandeiras (`🇧🇷 PT` e `🇺🇸 EN`), efeito visual ativo em azul/índigo e estados de hover elegantes.
  - Adicionado o botão "Página Inicial" com ícone de casa ao lado do seletor para facilidade de navegação.

---

## [1.5.0] - 2026-08-02

### ✨ Adicionado (Added)
- **Card Interativo de Memória de Cálculo da Nota (`ScorePopoverCard`)**:
  - Card popover flutuante ativado por hover no card executivo sobre a nota (ex.: `B+`, `80/100`) ou sobre a badge de nível de risco (`Risco Moderado`).
  - Exibe o detalhamento transparente de todos os descontos aplicados (CVEs por severidade e licenças), além da fórmula matemática.
- **Sistema de 3 Níveis de Classificação de Risco**:
  - 🟢 **Baixo Risco** (Score >= 85)
  - 🟡 **Risco Moderado** (70 <= Score < 85)
  - 🔴 **Risco Elevado** (Score < 70)

### 🐛 Corrigido & Refatorado (Fixed & Refactored)
- **Fórmula de Cálculo 1-para-1 Direta e Transparente**:
  - Substituída a escala logarítmica por um modelo de subtração direta: `Nota Final = Math.max(0, 100 - Penalidades)`.
  - Garantida paridade matemática exata entre os pontos exibidos no card e a nota final (ex.: `-5.1 pts` resulta em `100 - 5.1 = 94.9` -> `95/100`).
- **Normalização de Nome de Aplicações para Scanners CLI**:
  - Tratamento para quando ferramentas (ex.: Trivy) geram `"name": "."` ou `"./"`, utilizando o nome do arquivo ou fallback `'Aplicação SCA'`.
- **Hardening de Docker Container Não-Root (`USER nginx`)**:
  - Resolução completa de permissões `(13: Permission denied)` e redirecionamento de pastas temporárias para `/tmp/`.
- **Sanitização SAST (Semgrep Zero Vulnerabilidades)**:
  - 100% de aprovação em 446 regras estáticas do Semgrep sobre 90 arquivos.

---

## [1.4.8] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Fórmula de Cálculo Transparente e Linear (1-para-1)**:
  - Substituída a escala logarítmica implícita por uma fórmula de pontuação linear direta: `Nota Final = Math.max(0, 100 - Penalidades)`.
  - Agora, cada ponto de penalidade exibido no tooltip subtrai exatamente 1 ponto da nota final (ex.: `-5.1 pts` resulta diretamente em `100 - 5.1 = 94.9` -> **`95/100`** `Grade A` / `Baixo Risco`), eliminando qualquer discrepância entre os pontos exibidos no card e a nota calculada.

---

## [1.4.7] - 2026-08-02

### 🎨 Ajustado (Refactored)
- **Posicionamento e Elevação do Hover Card de Cálculo (`ScorePopoverCard`)**:
  - Ajustado o posicionamento do card popover de `top-full` para `bottom-full mb-3`, fazendo com que ele abra para cima (direção ao topo do container) e impedindo qualquer corte de visualização causado pela borda inferior do card ou pela pilha de camadas (*z-index*) do grafo topológico 2D.
  - Adicionado contexto de empilhamento `relative z-30` no container principal do `ExecutiveScoreCard`.

---

## [1.4.6] - 2026-08-02

### ✨ Adicionado (Added)
- **Card Interativo de Memória de Cálculo da Nota (Hover Tooltip)**:
  - Adicionado card popover interativo em `ExecutiveScoreCard.tsx` que aparece ao passar o mouse sobre a nota (ex.: `B+`, `80/100`) ou sobre a badge de risco (`Risco Moderado`).
  - O card exibe a memória detalhada de cálculo: subtotal de penalidades de CVEs por severidade, penalidades por licenças copyleft/desconhecidas e a fórmula matemática logarítmica aplicada (`100 - log(1 + Penalidades) × 11`).

---

## [1.4.5] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Normalização do Nome da Aplicação**:
  - Ajustada a extração de metadados em `normalizer.ts` para quando o scanner (ex.: Trivy) gera `"name": "."` ou `"./"`. A aplicação agora utiliza o nome limpo do arquivo (ex.: `sbom` ou `juice-shop`) ou o fallback `'Aplicação SCA'` em vez de exibir um único ponto `.` no cabeçalho e nos cards.
- **Refinamento do Cálculo de Rating & Níveis de Risco**:
  - Limite de penalidade para licenças desconhecidas/ausentes em pacotes transitivos para evitar que projetos com **0 vulnerabilidades (0 CVEs)** caiam de pontuação injustamente.
  - Implementado sistema de 3 níveis de classificação no card executivo:
    - **Score >= 85**: 🟢 `Baixo Risco` (Emerald)
    - **70 <= Score < 85**: 🟡 `Risco Moderado` (Amber)
    - **Score < 70**: 🔴 `Risco Elevado` (Rose)

---

## [1.4.4] - 2026-08-02

### 🛡️ Segurança (Security & Dependencies)
- **Atualização de Segurança `fast-xml-parser` (`v4.5.7` -> `v5.10.1`)**:
  - Atualizada a biblioteca `fast-xml-parser` para a versão `v5.10.1` em `frontend/package.json` e `package-lock.json`, eliminando a vulnerabilidade detectada na imagem gerada pelo Trivy.
  - Regerado o arquivo `sbom.json` de produção do repositório `sca` confirmando **0 vulnerabilidades encontradas**.

---

## [1.4.3] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Permissões do Container Nginx para Usuário Não-Root (`USER nginx`)**:
  - **`frontend/Dockerfile`**: Inclusão de `chown -R nginx:nginx` para os diretórios `/var/cache/nginx`, `/var/run/nginx.pid`, `/var/log/nginx` e `/etc/nginx/conf.d`.
  - **`frontend/nginx.conf`**: Redirecionamento das pastas temporárias do Nginx (`client_body_temp_path`, `proxy_temp_path`, `fastcgi_temp_path`) para `/tmp/`, eliminando a falha `mkdir() "/var/cache/nginx/client_temp" failed (13: Permission denied)`.

---

## [1.4.2] - 2026-08-02

### 🛡️ Segurança (Security & Code Audit)
- **Remediação Completa SAST (Semgrep Zero Vulnerabilities)**:
  - **`frontend/Dockerfile`**: Adicionada a instrução `USER nginx` antes da execução do container no estágio de produção, neutralizando CWE-250 (Execution with Unnecessary Privileges).
  - **`PackageDetailModal.tsx`**: Removido o uso desnecessário de `dangerouslySetInnerHTML`, substituído por interpolação segura de JSX com escaping automático no React (CWE-79 XSS).
  - **`LanguageContext.tsx`**: Adicionadas proteções estritas contra chaves reservadas do protótipo (`__proto__`, `constructor`, `prototype`) e verificação via `Object.prototype.hasOwnProperty.call`, neutralizando o risco de Prototype Pollution (CWE-915).
  - **Resultado do Scan Semgrep**: **0 achados (0 blocking findings)** em 446 regras executadas sobre 90 arquivos.

---

## [1.4.1] - 2026-08-02

### 🎨 Ajustado (Refactored)
- **Simplificação de Domínio (`sca.brunoizidorio.com.br`)**: Atualização e padronização do nome de domínio de produção de `cyclonedx.brunoizidorio.com.br` para `sca.brunoizidorio.com.br` no `nginx.conf`, no rodapé (`LandingFooter.tsx`) e em toda a documentação de implantação.

---

## [1.4.0] - 2026-08-02

### ✨ Adicionado (Added)
- **Pipeline de CI/CD do GitLab (`.gitlab-ci.yml`)**: Criação da infraestrutura modular de CI/CD na pasta `.gitlab/ci/` contendo os estágios:
  - `security-scan` (Semgrep SAST, Gitleaks Secret Detection, Trivy FS)
  - `test` (Testes unitários automatizados com Vitest e Node.js 24)
  - `build` (Compilação da SPA React via Vite)
  - `docker-build` & `docker-security` (Construção da imagem Docker e scan de vulnerabilidade no Container Registry)
  - `deploy` (Implantação automatizada na VPS `oracle-vps` na porta `8080`)
- **Guia Completo de Produção (`PROD.md` & `docs/PROD.md`)**: Documentação técnica detalhando a arquitetura 100% Client-Side, pré-requisitos do servidor, configuração de chaves de deploy SSH (`vps-sca-deploy`), Proxy Reverso Nginx + SSL/TLS com Certbot para o domínio `sca.brunoizidorio.com.br` e verificação de segurança.

---

## [1.3.2] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Navegação de Retorno à Tela Inicial pelo Título/Logo**: Configurado o manipulador `onClick={reset}` no elemento do logo e título principal do cabeçalho (`CycloneDX SCA Visualizer`), garantindo que o clique em qualquer aba ou visualização resete o modelo carregado e retorne o usuário à tela inicial da landing page.

---

## [1.3.1] - 2026-08-02

### ✨ Adicionado (Added)
- **Overlay de Processamento & Feedback de UX (`processing-overlay`)**: Adicionada modal com backdrop fosco, spinner animado e mensagens traduzidas (`Processando Arquivo SBOM...`) no `Dropzone.tsx` e no `SampleLoader.tsx`, garantindo que uploads de arquivos JSON/XML massivos informem visualmente o usuário durante a etapa de parsing e normalização de grafos.

### 🎨 Ajustado (Refactored)
- **Amostra Curada do OWASP Juice Shop**: Reformulação da amostra de demonstração do **OWASP Juice Shop** (`juice-shop-cyclonedx.json`) para conter 16 pacotes representativos em 4 níveis de profundidade, vulnerabilidades críticas reais (CVE-2024-29018, CVE-2023-48223, CVE-2022-25883, CVE-2021-3749) e licenças restritivas Copyleft/Permissivas, oferecendo visualização limpa no Grafo 2D e MiniMapa sem sobrecarregar a memória do navegador.

---

## [1.3.0] - 2026-08-02

### ✨ Adicionado (Added)
- **Amostra Oficial do OWASP Juice Shop**: Substituição do exemplo genérico `NPM App` pelo modelo real e completo do **OWASP Juice Shop** (`juice-shop-cyclonedx.json`) no componente `SampleLoader.tsx` e no diretório estático `frontend/public/samples/`.
- **Experiência de Demonstração Rica**: O novo exemplo de demonstração permite visualizar mais de 75 mil linhas de código SBOM, centenas de dependências diretas e transitivas, vulnerabilidades críticas reais (CVE-2024-29018, CVE-2023-48223) e matriz de licenças complexa.

---

## [1.2.1] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Flag `--include-dev-deps` no Comando Trivy**: Adicionada a flag `--include-dev-deps` no comando sugerido do Trivy no seletor de ferramentas do Passo 01 (`trivy fs --format cyclonedx --include-dev-deps --output sbom.json .`), garantindo que dependências dev/sub-pacotes em repositórios Node/JavaScript não sejam omitidos pelo scanner do Trivy.

---

## [1.2.0] - 2026-08-02

### ✨ Adicionado (Added)
- **Seletor Interativo de Ferramentas CLI de SBOM (Passo 01)**: Implementado seletor de abas interativas no componente `HowItWorks.tsx` para alternar entre as principais ferramentas mencionadas (**Trivy**, **cdxgen**, **Syft** e **CycloneDX CLI**).
- **Comandos Precisos de Exportação**: Exibição dos comandos exatos para geração de arquivo SBOM no padrão CycloneDX (ex.: `trivy fs --format cyclonedx --output sbom.json .`) com botão integrado de copiar para a área de transferência (`Copy to Clipboard`).

---

## [1.1.4] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Tradução Global Remanescente (i18n)**: Tradução dos termos "Alto ROI" (`High ROI`), "Inspecionar" (`Inspect`), "Expandir todos" (`Expand All`), "Recolher todos" (`Collapse All`), "Buscar por pacote na árvore..." (`Search package in tree...`) e "Novo SBOM" (`New SBOM`) / "Carregar Outro SBOM" (`Load Another SBOM`) em `App.tsx`, `TreeView.tsx`, `QuickWinsList.tsx` e `ExecutiveDashboard.tsx`.

---

## [1.1.3] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Compilação de Produção TypeScript (Strict)**: Remoção do `import` não utilizado `vi` em `LanguageContext.test.tsx` que causava falha de compilação `TS6133` durante o comando `npm run build` / `tsc` na etapa do Docker build.

---

## [1.1.2] - 2026-08-02

### 🐛 Corrigido (Fixed)
- **Internacionalização Completa (i18n)**: Subscrição e substituição de todas as strings em português codificadas rigidamente pelas chaves dinâmicas do `LanguageProvider` em `en-US.json` e `pt-BR.json` para os componentes `GraphCanvas.tsx`, `ScaNodeComponent.tsx`, `TreeView.tsx`, `ComponentExplorer.tsx` e `PackageDetailModal.tsx`.
- **Navegador Topológico em Inglês**: Tradução completa dos textos do painel superior, legenda ("Root", "Direct", "Transitive", "Impact Path"), contagem de nós/conexões e etiquetas dos nós no grafo 2D ao comutar para `English (US)`.

---

## [1.1.1] - 2026-08-02

### ✨ Adicionado (Added)
- **Animações GSAP nos Modais**: Integração da biblioteca GSAP (`gsap`) para animações fluidas de abertura (escala, posição `y` e opacidade) e fechamento estético do modal de inspeção de componentes (`PackageDetailModal.tsx`).

---

## [1.1.0] - 2026-08-02

### ✨ Adicionado (Added)
- **Landing Page Completa**: Reformulação total da página inicial (`LandingPage`) com paridade visual em relação ao projeto Semgrep CLI Visualizer:
  - `HeroSection`: Destaques radiais, título em gradiente e botões de ação rápida.
  - `SecurityFeatures`: Garantias de execução 100% Client-Side em memória RAM, proteção Anti-XXE e performance de normalização.
  - `ValueProps`: Apresentação dos 6 pilares do sistema (SCA Rating, Grafo 2D, TreeView, Component Explorer, Quick Wins e CycloneDX Multi-Versão).
  - `HowItWorks`: Fluxo de uso simplificado em 3 passos com integração a ferramentas como `cdxgen`, `trivy` e `syft`.
  - `FaqSection`: Acordeão interativo respondendo a dúvidas comuns de privacidade, formatos e pontuação.
  - `LandingFooter`: Rodapé oficial com informações de versão, copyright e notas de segurança.
- **Grafo 2D no Dashboard Executivo**: Embedment do `<GraphCanvas />` diretamente no `ExecutiveDashboard`, mantendo também a presença na aba dedicada "Grafo 2D de Dependências".

### 🐛 Corrigido (Fixed)
- **Estilização dos Controles do React Flow**: Aplicação de tema escuro nos botões de controle de zoom/pan para eliminar o fundo branco contrastante.
- **Renderização do MiniMapa**: Inclusão explícita de `width: 240` e `height: 95` nas propriedades dos objetos de nó no `graphLayout.ts`, permitindo o cálculo correto do viewBox e exibição dos mini retângulos com código de cores.

### 🔧 Alterado (Changed)
- **Node.js LTS**: Atualização da imagem de build do Dockerfile de `node:20-alpine` para `node:24-alpine` (Node.js LTS 24).
- **Documentação**: Atualização do `README.md` refletindo os pré-requisitos do Node.js 24.x.

---

## [1.0.0] - 2026-08-01

### ✨ Adicionado (Added)
- Versão inicial do **CycloneDX SCA Visualizer**:
  - Parser e Normalizador de arquivos CycloneDX JSON (v1.2 a v1.6) e XML (v1.0 a v1.6).
  - Algoritmo de cálculo de pontuação logarítmica de saúde em segurança (0 a 100 e Notas A+ a F).
  - Algoritmo de identificação de Quick Wins de remediação baseados em impacto downstream.
  - Dashboard Executivo com gráficos Recharts para Matriz de Licenças e Profundidade de Supply Chain.
  - Navegador Topológico 2D com Dagre layout automatizado e React Flow.
  - Árvore Hierárquica Colapsável e Explorador de Pacotes com filtros e busca instantânea.
  - Modal de detalhes do componente com proteção contra XSS (DOMPurify).
  - Suporte a i18n em tempo real (PT-BR e EN-US).
