# 🤝 Guia de Contribuição (CONTRIBUTING.md)

Primeiramente, obrigado por seu interesse em contribuir com o **CycloneDX SCA Visualizer**! 

Este projeto adota o princípio de **Security-First** e **Privacy-First (100% Client-Side RAM)**. Todas as contribuições devem manter os mais altos padrões de segurança, privacidade do usuário, testabilidade e qualidade de código.

---

## 📜 Princípios Fundamentais

1. **100% Client-Side & Privacy-First**:
   - Nenhum dado de SBOM, dependência ou fonte de código pode ser enviado para servidores externos ou banco de dados. Toda a análise deve ser processada em memória RAM local no navegador do usuário.
2. **Defesa em Profundidade & Sanitização (OWASP)**:
   - Todo input de usuário ou arquivo carregado deve ser sanitizado contra XSS (via DOMPurify) e XXE (desabilitando DTDs externas no parser XML).
3. **Container Não-Root**:
   - Imagens Docker devem sempre rodar com usuário sem privilégios (`USER nginx`).
4. **Semgrep SAST 100% Limpo**:
   - Código novo não deve introduzir nenhum achado de vulnerabilidade SAST.

---

## 🛠️ Configuração do Ambiente de Desenvolvimento

### Pré-requisitos:
- **Node.js**: `v24.x LTS` ou superior
- **npm**: `v10.x` ou superior
- **Git**: `v2.x` ou superior

### Passos para Inicialização:

```bash
# 1. Clonar o repositório
git clone git@gitlab.com:brunoizidorio/sca.git
cd sca

# 2. Entrar na pasta do frontend e instalar as dependências
cd frontend
npm install

# 3. Iniciar o servidor de desenvolvimento Vite
npm run dev
```

Acesse no navegador: `http://localhost:5173` (ou porta informada pelo Vite).

---

## 🧪 Suíte de Testes (Vitest & AAA Pattern)

Todas as novas funcionalidades ou correções de bugs **devem incluir testes automáticos**:

- **Padrão AAA**: Todos os testes devem seguir explicitamente o padrão **Arrange, Act, Assert**.
- **Execução da Suíte**:
  ```bash
  cd frontend
  npm run test -- --run
  ```
- **Taxa de Aprovação**: 100% dos testes devem passar antes de abrir qualquer Merge Request ou commit.

---

## 🔒 Regras de Commits & Versionamento

### Conventional Commits:
Adotamos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(componente)`: Nova funcionalidade para o usuário.
- `fix(componente)`: Correção de bug.
- `security(docker)`: Melhoria de segurança ou remediação SAST.
- `chore(release)`: Atualização de documentação ou bump de versão.
- `docs(...)`: Alteração exclusiva em documentação.

Exemplo:
```bash
git commit -m "feat(dashboard): add interactive score breakdown calculation hover card"
```

### Regra Obrigatória de Bump de Versão & Changelog:
Sempre que fizer uma alteração relevante no código:
1. Atualize a versão em `frontend/package.json` (`npm version patch` ou `minor`).
2. Adicione a seção correspondente em `CHANGELOG.md` no padrão [Keep a Changelog](https://keepachangelog.com/).
3. Atualize os badges de versão em `README.md` e `PROD.md`.

---

## 🤖 Agentes de IA & WebMCP

Este repositório é fully **Agent Ready**. Caso adicione novos endpoints ou ferramentas:
- Mantenha atualizado o índice de habilidades em `frontend/public/.well-known/agent-skills/index.json`.
- Registre novas ferramentas in-browser em `frontend/src/utils/webMcp.ts` via `navigator.modelContext.provideContext()`.

---

## 📄 Licença

Ao contribuir com este repositório, você concorda que suas contribuições serão licenciadas sob a licença **MIT** do projeto.
