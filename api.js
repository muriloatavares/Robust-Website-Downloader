const axios = require('axios');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const readline = require('readline');
const chalk = require('chalk'); // Para logs coloridos
const pLimit = require('p-limit'); // Para limitar conexões simultâneas

// Configurações globais
const CONFIG = {
    timeout: 10000, // Timeout de 10 segundos
    retries: 3, // Número de tentativas para baixar recursos
    concurrentDownloads: 5, // Limite de downloads simultâneos
    userAgent: 'Mozilla/5.0 (compatible; RobustWebsiteDownloader/3.0)'
};

// Configuração global para requisições HTTP
const axiosInstance = axios.create({
    timeout: CONFIG.timeout,
    headers: {
        'User-Agent': CONFIG.userAgent
    }
});

// Função para criar diretórios recursivamente
function ensureDirectoryExistence(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Função para sanitizar o nome do domínio
function sanitizeDomainName(domainName) {
    return domainName.replace(/[^a-zA-Z0-9.-]/g, '_'); // Substitui caracteres inválidos por "_"
}

// Função para salvar um recurso em uma pasta específica com tentativas de repetição
async function downloadResource(baseUrl, resourceUrl, outputDir, subFolder, retries = CONFIG.retries) {
    try {
        const resolvedUrl = new URL(resourceUrl, baseUrl).href; // Resolve URLs relativas
        const relativePath = new URL(resourceUrl, baseUrl).pathname; // Caminho relativo do recurso
        const fileName = path.basename(relativePath); // Nome do arquivo
        const folderPath = path.join(outputDir, subFolder); // Pasta específica
        const filePath = path.join(folderPath, fileName);

        ensureDirectoryExistence(folderPath); // Garante que o diretório existe

        const response = await axiosInstance.get(resolvedUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, response.data);
        console.log(chalk.green(`✔ Recurso salvo: ${filePath}`));
    } catch (error) {
        if (retries > 0) {
            console.warn(chalk.yellow(`⚠ Falha ao baixar recurso (${resourceUrl}). Tentando novamente... (${retries} tentativas restantes)`));
            await downloadResource(baseUrl, resourceUrl, outputDir, subFolder, retries - 1);
        } else {
            console.error(chalk.red(`✖ Erro ao baixar recurso (${resourceUrl}): ${error.message}`));
        }
    }
}

// Função para baixar a estrutura completa de um website
async function downloadWebsite(url, outputDir) {
    try {
        console.log(chalk.blue(`🔄 Iniciando o download do site: ${url}`));

        // Fazendo a requisição HTTP para obter o HTML
        const response = await axiosInstance.get(url);
        const html = response.data;

        // Criando o diretório de saída, se não existir
        ensureDirectoryExistence(outputDir);

        // Salvando o HTML principal na pasta "html"
        const htmlDir = path.join(outputDir, 'html');
        ensureDirectoryExistence(htmlDir);
        const indexPath = path.join(htmlDir, 'index.html');
        fs.writeFileSync(indexPath, html, 'utf-8');
        console.log(chalk.green(`✔ HTML principal salvo em: ${indexPath}`));

        // Carregando o HTML com cheerio para extrair recursos
        const $ = cheerio.load(html);

        // Baixando recursos externos (imagens, CSS, JS)
        const resources = [];
        $('img[src], link[rel="stylesheet"], script[src]').each((_, element) => {
            const tag = $(element);
            const src = tag.attr('src') || tag.attr('href');
            if (src) {
                const resourceType = tag.is('img') ? 'images' :
                                     tag.is('link') ? 'css' :
                                     tag.is('script') ? 'js' : 'others';
                resources.push({ src, type: resourceType });
            }
        });

        console.log(chalk.blue(`🔍 Encontrados ${resources.length} recursos para baixar.`));

        // Limita o número de downloads simultâneos
        const limit = pLimit(CONFIG.concurrentDownloads);
        const downloadPromises = resources.map(({ src, type }) =>
            limit(() => downloadResource(url, src, outputDir, type))
        );

        await Promise.all(downloadPromises);

        console.log(chalk.green('✅ Download completo e estrutura organizada!'));
    } catch (error) {
        console.error(chalk.red(`❌ Erro ao baixar o website: ${error.message}`));
    }
}

// Função para capturar a URL do usuário
function askForUrl() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(chalk.cyan('🌐 URL do site para baixar: '), (url) => {
        try {
            // Valida a URL fornecida
            const parsedUrl = new URL(url);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                throw new Error('Protocolo inválido. Use http ou https.');
            }

            // Sanitiza o nome do domínio para evitar path injection
            const domainName = sanitizeDomainName(parsedUrl.hostname.replace('www.', ''));
            const outputDirectory = path.resolve(__dirname, domainName); // Diretório com o nome do site

            console.log(chalk.blue(`📂 Criando pasta para o site: ${outputDirectory}`));
            downloadWebsite(url, outputDirectory).then(() => {
                console.log(chalk.green(`🎉 Arquivos salvos na pasta: ${outputDirectory}`));
                rl.close();
            }).catch((error) => {
                console.error(chalk.red(`❌ Erro: ${error.message}`));
                rl.close();
            });
        } catch (error) {
            console.error(chalk.red(`❌ URL inválida: ${error.message}`));
            rl.close();
        }
    });
}

// Executa o script
askForUrl();