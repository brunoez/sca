# 🌐 Guia de Habilitação do DNSSEC para DNS-AID (Resolver erro "AD=true was not returned")

O teste de validação do **DNS-AID** já encontrou com sucesso os registros no Cloudflare! O único item pendente é a validação de assinatura criptográfica **DNSSEC (Flag AD=true)**.

---

## 🛠️ Passo a Passo para Ativar o DNSSEC no Cloudflare + Registro.br

### 1️⃣ Passo 1: Ativar no Cloudflare DNS
1. Acesse o painel do **Cloudflare** -> Selecione `brunoizidorio.com.br`.
2. Vá na aba **DNS** -> **Settings** (ou role até a seção **DNSSEC** na página de registros).
3. Clique em **Enable DNSSEC**.
4. O Cloudflare exibirá os dados da chave **DS (Delegation Signer)**:
   - **Key Tag** (ex: `2371` ou número similar)
   - **Algorithm** (ex: `13` - ECDSA P-256)
   - **Digest Type** (ex: `2` - SHA-256)
   - **Digest** (sequência hexadecimal longa)

### 2️⃣ Passo 2: Cadastrar a chave DS no Registro.br
1. Acesse a sua conta no **Registro.br** (ou no seu registrador de domínio).
2. Clique no domínio **`brunoizidorio.com.br`**.
3. Role até a seção **DNSSEC** -> Clique em **Configurar DNSSEC** / **Adicionar Chave DS**.
4. Cole os valores informados pelo Cloudflare (**Key Tag**, **Algoritmo**, **Tipo de Digest** e **Digest**).
5. Clique em **Salvar**.

---

## ⏱️ Tempo de Propagação
Após salvar a chave DS no Registro.br, os servidores raiz TLD `.br` atualizarão a assinatura em aproximadamente **5 a 15 minutos**. 

Assim que a propagação concluir, os servidores de DNS validadores (como o Cloudflare 1.1.1.1 e Google 8.8.8.8) retornarão o flag **`AD=true` (Authenticated Data)** e o teste DNSSEC ficará **100% Aprovado (Verde)**!
