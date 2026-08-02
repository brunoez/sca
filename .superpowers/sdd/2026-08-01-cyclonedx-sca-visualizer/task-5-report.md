# Task 5 Report: Landing Page & Dropzone Component

## Resumo da Execução
A **Task 5 (Landing Page & Dropzone Component)** foi executada com sucesso. Implementamos os componentes de upload por arrastar e soltar (Drag & Drop), o carregador de amostras de SBOM com 1 clique (NPM JSON e Python XML), arquivos de exemplo oficiais e testes unitários abrangentes com Vitest e React Testing Library.

---

## 🛠️ Artefatos Criados & Atualizados

1. **Amostras de SBOM CycloneDX:**
   - [`public/samples/sample-npm-cyclonedx.json`](file:///home/bruno/Projetos/sca/frontend/public/samples/sample-npm-cyclonedx.json): Arquivo CycloneDX JSON v1.4 contendo metadados de aplicação, componentes diretos (express, lodash, gpl-logger), componentes transitivos (body-parser, qs), atribuições de licenças (MIT, BSD-3-Clause, GPL-3.0) e apontamento de vulnerabilidade (CVE-2024-29018).
   - [`public/samples/sample-python-cyclonedx.xml`](file:///home/bruno/Projetos/sca/frontend/public/samples/sample-python-cyclonedx.xml): Arquivo CycloneDX XML v1.4 contendo metadados de aplicação Python FastAPI, componentes diretos e transitivos (pydantic, starlette, urllib3) e licenças.

2. **Componentes React Frontend (`src/components/landing/`):**
   - [`src/components/landing/Dropzone.tsx`](file:///home/bruno/Projetos/sca/frontend/src/components/landing/Dropzone.tsx):
     - Suporte a Drag & Drop e clique para seleção de arquivo via `file-input`.
     - Processamento em memória RAM do navegador com `FileReader`.
     - Integração com `parseAndNormalizeSbom` e atualização reativa do Zustand store (`useScaStore`).
     - Feedback visual rico (estados de drag over, loading, sucesso e mensagens de erro amigáveis).
     - Acessibilidade ARIA (`role="button"`, suporte a teclado Enter/Espaço, `tabIndex`).
   - [`src/components/landing/SampleLoader.tsx`](file:///home/bruno/Projetos/sca/frontend/src/components/landing/SampleLoader.tsx):
     - Botões de ação rápida para carregar exemplos com 1 clique.
     - Fallback resiliente em memória caso a requisição HTTP local falhe (ex: ambiente de teste offline).

3. **Testes Unitários:**
   - [`src/components/landing/__tests__/Dropzone.test.tsx`](file:///home/bruno/Projetos/sca/frontend/src/components/landing/__tests__/Dropzone.test.tsx):
     - Suíte de testes em padrão AAA (Arrange, Act, Assert).
     - Validação de renderização da interface do Dropzone.
     - Validação de upload de arquivo CycloneDX JSON via input.
     - Validação de tratamento de erro para extensão não suportada (.pdf).
     - Validação de evento `drop` com arquivo CycloneDX XML.
     - Validação do carregador de amostras `SampleLoader` para NPM JSON e Python XML.

---

## 🔒 Checklist de Segurança e Qualidade

- [x] **Client-Side RAM Execution:** Arquivos são processados 100% no navegador sem envio a servidor externo.
- [x] **Input Validation:** Validação de formato (.json / .xml) e estrutura sanitizada.
- [x] **Acessibilidade & UX:** Suporte a leitores de tela e navegação por teclado.
- [x] **Testes Automatizados:** Testes criados cobrindo cenários felizes e de erro.

---

> **Data de Conclusão:** 2026-08-01  
> **Status:** Concluído com sucesso.
