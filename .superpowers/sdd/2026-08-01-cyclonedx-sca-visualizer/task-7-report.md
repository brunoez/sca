# Relatório de Execução - Task 7: Graph Layout Engine & React Flow 2D Canvas

**Data:** 01/08/2026  
**Status:** Concluído com Sucesso  
**Projeto:** CycloneDX SCA Visualizer  
**Escopo:** Graph Layout Engine (`@dagrejs/dagre`), Componente de Nó Customizado React Flow (`ScaNodeComponent`), Canvas 2D Interativo (`GraphCanvas`) e Suíte de Testes Unitários.

---

## 1. Sumário Executivo

A **Task 7: Graph Layout Engine & React Flow 2D Canvas** foi implementada com foco em alta performance, clareza visual e experiência interativa de rastreamento de segurança no ecossistema de dependências de software (SCA).

A engine de layout processa a estrutura do modelo `ScaSbomModel` e realiza um cálculo topológico direcionado (Left-to-Right) via algoritmo `@dagrejs/dagre`. Ela calcula posições exatas para nós da aplicação raiz (Depth 0), dependências diretas (Depth 1) e dependências transitivas em N níveis de profundidade (Depth 2+).

---

## 2. Componentes Criados e Atualizados

### 2.1. Service: `src/services/graphLayout.ts`
- **Função Principal:** `getLayoutedElements(model, impactPathRefs, selectedRef)`
- **Responsabilidades:**
  - Conversão do modelo `ScaSbomModel` para nós (`Node<ScaNodeData>`) e conexões (`Edge`) compatíveis com `@xyflow/react`.
  - Configuração do grafo Dagre com orientação `LR` (Left-to-Right), espaçamento entre nós de 60px e espaçamento entre níveis (ranks) de 140px.
  - Inclusão do nó principal de aplicação raiz (`isRoot: true`, Depth 0).
  - Suporte ao destaque dinâmico do **Caminho de Impacto** (`impactPathRefs`):
    - Nós no caminho recebem a flag `isImpactPath = true`.
    - Arestas conectando nós do caminho de impacto são destacadas na cor ciano (`#22d3ee`), com espessura aumentada (3px) e animação ativa (`animated: true`).

### 2.2. Componente de Nó Customizado: `src/components/graph/ScaNodeComponent.tsx`
- **Exibição:**
  - **Nome do Pacote:** Texto em negrito com visualização truncada e `title` nativo para exibição completa ao passar o cursor.
  - **Versão:** Exibição font-mono no formato `vX.Y.Z`.
  - **Badge de Tipo:**
    - `Raiz` (Purple) para o componente raiz.
    - `Direta` (Cyan) para dependências diretas de nível 1.
    - `Transitiva Lvl N` (Slate/Indigo) para dependências transitivas de profundidade N.
  - **Badge de Licença:**
    - **Verde (Permissiva):** MIT, Apache, BSD, ISC, CC0, etc.
    - **Vermelho (Copyleft):** GPL, AGPL, MPL, EUPL, etc.
    - **Amarelo (Desconhecida / Ausente):** Indicação clara para licenças não declaradas ou de risco intermediário.
  - **Badge de CVEs:**
    - `🔥 X CVEs` (Vermelho) se houver vulnerabilidades Críticas ou Altas.
    - `⚠️ X CVEs` (Amarelo) se houver vulnerabilidades Médias ou Baixas.
    - `✔ 0 CVEs` (Verde) para pacotes sem vulnerabilidades conhecidas.
  - **Interatividade & Destaque Visual:**
    - Efeito de brilho em ciano (`shadow-[0_0_20px_rgba(34,211,238,0.4)]`) ao fazer parte do caminho de impacto.
    - Anel de foco ciano e fundo escurecido ao selecionar o nó.

### 2.3. Canvas Interativo 2D: `src/components/graph/GraphCanvas.tsx`
- **Recursos Integrados:**
  - Renderização via `@xyflow/react` com `fitView`, limites de zoom de 0.2x a 2.0x e bordas `smoothstep`.
  - **Controles (`<Controls />`):** Zoom in/out, redefinição de visão e ajuste de tela estilizado no tema escuro (`slate-900`).
  - **MiniMapa (`<MiniMap />`):** Cores codificadas por tipo de nó (Roxo = Raiz, Ciano = Direta, Grafite = Transitiva).
  - **Fundo (`<Background />`):** Padrão pontilhado sutil (`#334155`).
  - **Painel Superior de Legenda:** Exibe contagem de nós, conexões e atalhos de identificação visual.
  - **Painel Inferior de Caminho de Impacto:** Exibe a cadeia completa de dependências desde a raiz até a biblioteca selecionada (ex: `my-app → express → qs`).
  - **Seleção e Reset:** Clique em qualquer nó para calcular e destacar o caminho de impacto; clique no fundo do canvas para resetar a seleção.
  - **Estado Vazio:** Mensagem amigável solicitando o upload de arquivo SBOM quando nenhum modelo está carregado no estado Zustand.

---

## 3. Testes Unitários Criados

### 3.1. `src/services/__tests__/graphLayout.test.ts`
- `should transform ScaSbomModel into layouted React Flow nodes and edges using Dagre`: Valida criação exata de nós, conexões e cálculo de coordenadas `(x, y)` via Dagre.
- `should flag nodes and edges on the impact path when impactPathRefs is provided`: Garante atribuição das flags `isImpactPath`, `isSelected` e estilo animado ciano nas arestas do caminho.
- `should handle root-only model with no dependencies`: Garante comportamento gracioso com SBOMs contendo apenas o nó raiz.

### 3.2. `src/components/graph/__tests__/GraphCanvas.test.tsx`
- `should render empty state message when no model is available`: Testa o comportamento da tela sem SBOM.
- `should render 2D canvas and panel header when model is loaded in store`: Valida renderização do container principal e do painel de legenda topológico.
- `should display impact path panel when a library component is selected`: Garante exibição da sequência textual do caminho de impacto no painel inferior.

### 3.3. `src/components/graph/__tests__/ScaNodeComponent.test.tsx`
- Cobertura completa das combinações de renderização do nó customizado (Raiz, Direta, Transitiva Lvl N, licenças permissivas/copyleft, badges de CVEs).

---

## 4. Arquivos Entregues

1. `frontend/src/services/graphLayout.ts`
2. `frontend/src/components/graph/ScaNodeComponent.tsx`
3. `frontend/src/components/graph/GraphCanvas.tsx`
4. `frontend/src/services/__tests__/graphLayout.test.ts`
5. `frontend/src/components/graph/__tests__/GraphCanvas.test.tsx`
6. `frontend/src/components/graph/__tests__/ScaNodeComponent.test.tsx`
7. `frontend/src/setupTests.ts` (Atualizado com polyfills de ResizeObserver / DOMMatrixReadOnly para JSDOM)

---

## 5. Conclusão

A **Task 7** foi entregue integralmente conforme os requisitos do plano de desenvolvimento. A engine de layout Dagre e a interface visual React Flow proporcionam um ambiente 2D de alta usabilidade para auditoria de segurança de dependências e análise de cadeia de suprimentos (SCA).
