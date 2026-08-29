# 📱 Suporte a PWA & Recursos Offline (v1.7.0)

## 📌 Visão Geral do PWA (Progressive Web App)

O **CycloneDX SCA Visualizer** é uma aplicação web progressiva (PWA) de alta performance que pode ser instalada diretamente no sistema operacional (Windows, macOS, Linux, Android, iOS) sem necessidade de download de executáveis externos.

---

## 🛠️ Componentes do PWA

### 1. Web App Manifest (`manifest.json`)
Localizado em `frontend/public/manifest.json`, o manifesto define:
- **Nome do App**: CycloneDX SCA Visualizer
- **Display**: `standalone` (janela nativa sem barra de navegação de browser)
- **Cores de Tema**: `#0f172a` (Background) e `#0284c7` (Theme)
- **Ícone de Alta Resolução**: `icon.svg` (512x512, maskable)
- **Atalhos Rápidos**: Abrir diretamente em modo "Novo SBOM"

### 2. Service Worker (`sw.js`)
Localizado em `frontend/public/sw.js`, o Service Worker implementa:
- **Estratégia de Cache**: Network First com fallback offline instantâneo.
- **Ciclo de Vida de Atualização**: `clients.claim()` e `skipWaiting()` para garantir a versão mais recente em cada carregamento.

### 3. Botão "Instalar App" / "Abrir no App"
- **Barra de Endereços (Omnibox)**: Capturado via evento nativo `beforeinstallprompt` em navegadores baseados em Chromium (Google Chrome, Microsoft Edge, Brave, Opera).
- **Cabeçalho da Aplicação**: Botão com acionamento em 1 clique presente em `App.tsx`.

---

## 💻 Como Instalar o Aplicativo Desktop

1. Acesse a aplicação em `https://sca.brunoizidorio.com.br`.
2. Clique no botão **"Abrir no app"** na barra de endereços do Chrome/Edge ou no botão **"Instalar App"** no cabeçalho da aplicação.
3. Confirme a instalação. O atalho será adicionado à sua área de trabalho e menu iniciar do sistema operacional.
