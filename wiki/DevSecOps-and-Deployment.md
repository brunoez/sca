# 🚀 DevSecOps & Implantação em Produção

## 📌 Arquitetura do Container Docker Não-Root

O container de produção utiliza **Docker Multi-stage** baseado em **Node 24 LTS** e **Nginx Alpine-slim**:

- **Usuário Sem Privilégios (`USER nginx`)**: Executado sem permissões de root.
- **Redirecionamento de Pastas Temporárias**: Pastas temporárias configuradas em `/tmp/` no [`nginx.conf`](file:///home/bruno/Projetos/sca/frontend/nginx.conf).
- **Semgrep SAST Clean**: 100% livre de vulnerabilidades em 446 regras estáticas.

---

## 🤖 Pipeline de 6 Estágios no GitLab CI/CD

O arquivo [`.gitlab-ci.yml`](file:///.gitlab-ci.yml) orquestra 5 módulos especializados:

1. **`security-scan`**: Scans SAST (Semgrep, Gitleaks, Trivy FS).
2. **`test`**: Execução da suíte de testes Vitest (100% verde).
3. **`build`**: Compilação estática do Vite SPA.
4. **`docker-build`**: BuildKit atomizado com `docker push --all-tags`.
5. **`docker-security`**: Scan da imagem Docker compilada via Trivy.
6. **`deploy`**: Deploy automático sem downtime no servidor `oracle-vps` (porta `8081`).

---

## 🔒 Domínio & Servidor de Produção

- **URL Oficial**: `https://sca.brunoizidorio.com.br`
- **Porta Interna do Host**: `8081:80` (Isolada do `semgrep-app` na porta `8080`).
- **Nginx Reverse Proxy no Host**: SSL/TLS gratuito gerenciado via Certbot + Cloudflare.
