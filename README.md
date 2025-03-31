# Robust Website Downloader

![Node.js](https://img.shields.io/badge/Node.js-v16%2B-green)
![License](https://img.shields.io/badge/license-MIT-blue)

Um script robusto em Node.js para baixar a estrutura de websites, incluindo HTML, CSS, JavaScript, imagens e outros recursos. O script organiza os arquivos em uma estrutura de pastas clara e segura, com suporte a múltiplas conexões simultâneas, tratamento avançado de erros e funcionalidades adicionais como cache, exclusão de tipos de arquivos e compactação.

---

## 🚀 Funcionalidades

- **Baixa a estrutura completa de um website**: HTML, CSS, JS, imagens e outros recursos.
- **Organização automática**: Os arquivos são organizados em pastas específicas (`html`, `css`, `js`, `images`, etc.).
- **Sanitização de caminhos**: Proteção contra vulnerabilidades de path injection.
- **Controle de conexões simultâneas**: Configurável para evitar sobrecarregar o servidor.
- **Repetição inteligente**: Tenta baixar novamente recursos que falharam.
- **Cache de recursos**: Evita baixar novamente arquivos já existentes.
- **Exclusão de tipos de arquivos**: Permite ignorar tipos de arquivos específicos, como vídeos ou áudios.
- **Compactação automática**: Compacta os arquivos baixados em um arquivo `.zip`.
- **Modo de simulação**: Lista os recursos que seriam baixados sem realmente baixá-los.
- **Relatório final detalhado**: Inclui informações como tempo total, tamanho total dos arquivos e número de falhas.

---

## 🛠️ Pré-requisitos

- **Node.js**: Versão 16 ou superior.
- **NPM**: Gerenciador de pacotes do Node.js.

---

## 📦 Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/muriloatavares/robust-website-downloader.git
   cd robust-website-downloader

## ⚙️ Instale as dependências:
npm install axios cheerio chalk cli-progress archiver p-limit
