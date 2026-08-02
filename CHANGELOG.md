# 📜 Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
