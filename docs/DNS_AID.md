# 💡 Esclarecimento sobre o Erro "DS record must have a corresponding NS record"

## 📌 Onde inserir os dados do DNSSEC?

Conforme exibido na imagem do modal do Cloudflare (**DS Record**):
> *"Copy the DS record details below and add them to your domain registrar."*

O registro **DS (Delegation Signer)** **NÃO** deve ser adicionado no formulário do Cloudflare. O Cloudflare gera a chave e assina a zona automaticamente. O registro DS deve ser inserido no seu **Registrador de Domínio (Registro.br)** para delegar a confiança aos servidores do Cloudflare.

---

## 🛠️ Passo a Passo para Inserir no Registro.br

1. Acesse a sua conta no **Registro.br** (https://registro.br).
2. Clique no seu domínio **`brunoizidorio.com.br`**.
3. Role até a seção **DNSSEC** e clique em **Configurar DNSSEC** ou **Adicionar Chave DS**.
4. Copie exatamente os 4 campos exibidos no modal do Cloudflare (Imagem 2) e cole no Registro.br:

| Campo no Registro.br | Valor do Cloudflare |
| :--- | :--- |
| **Key Tag** | `2371` |
| **Algoritmo** | `13` (ECDSA Curve P-256 with SHA-256) |
| **Tipo de Digest** | `2` (SHA-256) |
| **Digest** | `5F9136FA48B82B0F3B8B618D2C13780D65F7AE3DD341280B89DEC3A6C806768` |

5. Clique em **Salvar** no Registro.br.

---

Após salvar no Registro.br, o status do DNSSEC no painel do Cloudflare mudará de "Pendente" para **"Ativo"** e a resposta autenticada **`AD=true`** passará na validação do DNS-AID!
