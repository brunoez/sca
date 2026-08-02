# 📜 Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

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
