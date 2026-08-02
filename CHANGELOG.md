# 📜 Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
