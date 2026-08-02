# Guia de Implantação em Produção (Docker, Nginx & GitLab CI/CD)

> **Domínio de Produção:** `sca.brunoizidorio.com.br`  
> **Arquitetura:** 100% Client-Side SPA (Zero Backend, Zero Data Persistence)  
> **Versão de Produção:** `v1.6.8`  
> **Stack de Produção:** Docker Multi-stage Não-Root (`USER nginx`) (Node 24 LTS + Nginx Alpine-slim) + Security Headers + Semgrep SAST Sanitized

---

## 📋 Visão Geral da Arquitetura de Produção

O **CycloneDX SCA Visualizer** é uma aplicação web estática (SPA) que executa o parsing de arquivos CycloneDX JSON/XML (v1.2 a v1.6), normalização do grafo de dependências 2D, árvore hierárquica colapsável, cálculo do algoritmo de pontuação de saúde em segurança e catálogo de vulnerabilidades **exclusivamente no navegador do cliente (RAM do navegador)**. 

Não há banco de dados, API backend ou armazenamento persistente de arquivos SBOM. O container Docker atua exclusivamente servindo os artefatos estáticos otimizados (HTML, JS, CSS, SVG) via Nginx de alta performance equipado com cabeçalhos de segurança recomendados pela OWASP (CSP, HSTS, X-Content-Type-Options, X-Frame-Options).

---

## 🛠️ Pré-requisitos do Servidor (VPS / Cloud)

Antes de iniciar a implantação na sua VPS (Oracle Cloud, DigitalOcean, AWS EC2, GCP ou servidor próprio):

- **Git:** Instalado na VPS (`sudo apt install -y git`)
- **Docker Engine:** Versão 24.0+ instalada
- **Docker Compose:** Plugin v2.0+ instalado
- **Portas Liberadas:** Porta `80` (HTTP) e `443` (HTTPS) no firewall/Security List
- **Domínio Apontado:** Registro DNS tipo `A` apontando `sca.brunoizidorio.com.br` para o IP público da VPS

---

## 🔑 Autorização para `git clone` na VPS (GitLab Deploy Keys)

Para permitir que a VPS faça o `git clone` e receba atualizações do repositório no GitLab de forma segura (sem expor credenciais pessoais):

### Opção A: SSH Deploy Key (Recomendada)

#### 1. Gerar um par de chaves SSH exclusivo para a VPS
Acesse o terminal da sua VPS e gere a chave sem passphrase (para permitir automação):
```bash
ssh-keygen -t ed25519 -C "vps-sca-deploy" -f ~/.ssh/id_ed25519 -N ""
```

#### 2. Copiar a chave pública gerada
Exiba a chave pública gerada na VPS:
```bash
cat ~/.ssh/id_ed25519.pub
```
*Copie todo o conteúdo exibido (começando com `ssh-ed25519 ...`).*

#### 3. Cadastrar a Deploy Key no GitLab
1. No GitLab, acesse o repositório do projeto (`sca`).
2. Vá em **Settings > Repository**.
3. Expanda a seção **Deploy Keys**.
4. Clique em **Add key**.
5. Preencha os campos:
   - **Title:** `VPS Production Server`
   - **Key:** Cole a chave pública copiada no passo anterior.
   - **Grant write permissions to this key:** ❌ **Deixe DESMARCADO** (princípio do menor privilégio — acesso somente leitura para o repositório).
6. Clique em **Add key**.

#### 4. Testar a Autorização SSH na VPS
Na VPS, teste a conexão SSH com o GitLab:
```bash
ssh -T git@gitlab.com
```
*Ao ser questionado sobre o fingerprint (`Are you sure you want to continue connecting`), digite `yes`.*  
Saída esperada: `Welcome to GitLab, @seu-usuario!` ou mensagem indicando autenticação bem-sucedida.

---

### Opção B: GitLab Deploy Token (Alternativa HTTP/HTTPS)

1. No GitLab, acesse **Settings > Repository > Deploy Tokens**.
2. Crie um token com nome `vps-deploy-token` e marque a permissão `read_repository`.
3. Utilize a URL com token no clone:
```bash
git clone https://gitlab-ci-token:<DEPLOY_TOKEN>@gitlab.com/brunoizidorio/sca.git /opt/sca
```

---

## 🚀 Primeiro Deploy Manual na VPS (Passo a Passo)

Siga este procedimento para realizar a primeira implantação da aplicação no servidor:

### Passo 1: Criar e Configurar o Diretório de Destino
Na VPS, crie a pasta `/opt/sca` e atribua permissão ao seu usuário não-root:
```bash
sudo mkdir -p /opt/sca
sudo chown -R $USER:$USER /opt/sca
```

### Passo 2: Clonar o Repositório via SSH
Execute o clone no diretório criado:
```bash
git clone git@gitlab.com:brunoizidorio/sca.git /opt/sca
cd /opt/sca
```

### Passo 3: Executar o Container via Docker Compose
Construa a imagem e inicie o container em segundo plano:
```bash
docker compose up -d --build
```

### Passo 4: Verificar a Execução Inicial
Certifique-se de que o container está ativo e respondendo localmente:
```bash
docker compose ps
curl -I http://localhost:8081
```
*O container estará servindo o Nginx interno na porta `8081`.*

---

## 🔒 Configuração de SSL/TLS (HTTPS) para `sca.brunoizidorio.com.br`

Para expor a aplicação publicamente com certificado SSL/TLS gratuito do Let's Encrypt:

### Nginx Reverse Proxy no Host + Certbot (Recomendado)

1. Instale Nginx e Certbot no host da VPS:
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
```

2. Crie o arquivo de configuração `/etc/nginx/sites-available/sca.brunoizidorio.com.br`:
```nginx
server {
    server_name sca.brunoizidorio.com.br;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

3. Ative o site e emita o certificado SSL:
```bash
sudo ln -s /etc/nginx/sites-available/sca.brunoizidorio.com.br /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d sca.brunoizidorio.com.br
```

---

## 🤖 Automatização do Deploy no GitLab CI/CD (`.gitlab-ci.yml`)

Após o **primeiro deploy manual**, a infraestrutura e o diretório `/opt/sca` já estão devidamente configurados na VPS. A partir deste ponto, o **GitLab CI/CD assume o deploy automatizado**.

### Como Funciona a Automação CI/CD

O projeto conta com o runner configurado com a tag `oracle-vps` diretamente na VPS de produção.

O estágio `deploy` está configurado no arquivo modular [`.gitlab/ci/deploy.gitlab-ci.yml`](file:///.gitlab/ci/deploy.gitlab-ci.yml) e incluído no [`.gitlab-ci.yml`](file:///.gitlab-ci.yml):

```yaml
deploy_production:
  stage: deploy
  image: docker:24-dind
  services:
    - docker:24-dind
  variables:
    DOCKER_DRIVER: overlay2
    DOCKER_TLS_CERTDIR: ""
  tags:
    - oracle-vps
  environment:
    name: production
    url: https://sca.brunoizidorio.com.br
  script:
    - echo "🚀 [1/4] Autenticando no GitLab Container Registry..."
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - echo "📥 [2/4] Baixando a imagem mais recente compilada ($CI_REGISTRY_IMAGE:latest)..."
    - docker pull $CI_REGISTRY_IMAGE:latest
    - echo "🐳 [3/4] Liberando a porta 8081 de quaisquer containers anteriores do SCA..."
    - docker rm -f sca-app || true
    - OLD_IDS=$(docker ps -a -q --filter "publish=8081")
    - if [ -n "$OLD_IDS" ]; then docker stop $OLD_IDS || true; docker rm -f $OLD_IDS || true; fi
    - echo "🚀 Iniciando novo container sca-app na porta 8081..."
    - docker run -d --name sca-app --restart always -p 8081:80 $CI_REGISTRY_IMAGE:latest
    - echo "🧹 [4/4] Limpando imagens antigas e não utilizadas..."
    - docker image prune -af
    - echo "✅ Deploy em produção concluído com sucesso!"
  only:
    - master
```

### Fluxo Continuativo do Pipeline

1. **Commit / Merge na branch `master`**: O pipeline do GitLab é disparado automaticamente.
2. **Estágios Anteriores**:
   - `security-scan` (Semgrep SAST, Gitleaks, Trivy FS)
   - `test` (Vitest com Node.js 24)
   - `build` (Vite Build)
   - `docker-build` & `docker-security` (Trivy Container)
3. **Estágio `deploy`**:
   - Baixa a imagem mais recente do container registry.
   - Substitui o container `sca-app` na porta `8080` sem downtime.
   - Executa a limpeza de imagens antigas com `docker image prune -af`.

---

## 🧪 Verificação de Saúde e Teste de Segurança

Após qualquer deploy (manual ou via CI/CD), valide a aplicação:

### 1. Teste de Cabeçalhos HTTP de Segurança
```bash
curl -I https://sca.brunoizidorio.com.br
```

### 2. Logs do Container em Produção
```bash
docker compose -f /opt/sca/docker-compose.yml logs -f
```
