# 🌐 Guia de Ativação DNSSEC no Registro.br (Formulário Simplificado)

No formulário do **Registro.br** (tela "ALTERAR SERVIDORES DNS"), os dois únicos campos necessários para a chave DS são:

- **Keytag 1**: `2371`
- **Digest 1**: `5F9136FA48B82B0F3B8B618D2C13780D65F7AE3DD341280B89DEC3A6C806768`

O Registro.br detecta automaticamente o algoritmo (13) e o tipo de digest (SHA-256) pelo tamanho do hash.

---

## 🚀 Próximo Passo:
1. Clique no botão verde **"SALVAR ALTERAÇÕES"**.
2. Aguarde entre **5 e 15 minutos** para a propagação na zona raiz `.br`.
3. O Cloudflare ativará o status **Active** no painel do DNSSEC e as consultas validadores retornarão o flag **`AD=true`**.
