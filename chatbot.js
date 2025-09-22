const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

// ============================
// 🔧 CONFIGURAÇÕES DO BOT
// ============================
const PROFISSIONAL_NOME = "Dra. Karla Sampaio";
const AGENDAMENTO_LINK = "https://calendar.app.google/SfBNgXZHyH429Yhy6";
const CONSULTA_DURACAO = "50 minutos";
const SOCIAL_LINK = "https://www.tiktok.com/@_karlasampaio_";

// Tempo limite de inatividade (em minutos)
const TEMPO_INATIVIDADE = 15;

// ============================
// 🚀 CONFIGURAÇÃO DO CLIENT
// ============================
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// ============================
// ⏱ GERENCIAMENTO DE SESSÕES
// ============================
let sessions = {};
let timers = {};

function encerrarContato(from, chat) {
    chat.sendMessage(
        `Foi um prazer falar com você! 😊\n\n` +
        `Se desejar, pode agendar sua consulta agora mesmo: ${AGENDAMENTO_LINK}\n\n` +
        `Siga nossas dicas também no TikTok 👉 ${SOCIAL_LINK}\n\n` +
        `Até breve, ${PROFISSIONAL_NOME} 💼`
    );
    delete sessions[from];
    delete timers[from];
}

async function enviarMenu(chat) {
    await chat.sendMessage(
        `📌 Você está falando com o *assistente virtual exclusivo da ${PROFISSIONAL_NOME}*.\n\n` +
        `Oferecemos uma primeira consulta de *${CONSULTA_DURACAO}* no Google Meet.\n\n` +
        `Escolha abaixo a área do Direito em que deseja atendimento:\n\n` +
        `1️⃣ Direito da Família 👨‍👩‍👧\n` +
        `2️⃣ Direito Trabalhista ⚖️\n` +
        `3️⃣ Direito Civil 📜\n` +
        `4️⃣ Direito Criminal 🚔\n` +
        `5️⃣ Direito Previdenciário 💰\n\n` +
        `👉 Digite o número da opção desejada.\n` +
        `👉 A qualquer momento, digite *0* para voltar ao menu inicial.`
    );
}

// ============================
// 📲 EVENTOS DO CLIENT
// ============================
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📌 Escaneie o QR Code acima para conectar no WhatsApp.');
});

client.on('ready', () => {
    console.log('✅ Bot conectado com sucesso!');
});

client.on('message', async msg => {
    const from = msg.from;
    const chat = await msg.getChat();

    // Reinicia contador de inatividade
    if (timers[from]) clearTimeout(timers[from]);
    timers[from] = setTimeout(() => encerrarContato(from, chat), TEMPO_INATIVIDADE * 60 * 1000);

    // Comando para reiniciar menu
    if (msg.body.trim() === '0') {
        sessions[from] = { etapa: 'inicio' };
        await enviarMenu(chat);
        return;
    }

    // Caso não haja sessão iniciada
    if (!sessions[from]) {
        sessions[from] = { etapa: 'inicio' };
        await enviarMenu(chat);
        return;
    }

    // Lógica do menu
    if (sessions[from].etapa === 'inicio') {
        switch (msg.body.trim()) {
            case '1':
                await chat.sendMessage(
                    `👨‍👩‍👧 Direito da Família:\n\n` +
                    `Atuamos em divórcios, guarda de filhos, pensão alimentícia e adoção.\n\n` +
                    `📌 Agende sua consulta de ${CONSULTA_DURACAO}:\n${AGENDAMENTO_LINK}`
                );
                break;

            case '2':
                await chat.sendMessage(
                    `⚖️ Direito Trabalhista:\n\n` +
                    `Defendemos seus direitos em demissões, horas extras e assédio moral.\n\n` +
                    `📌 Agende sua consulta:\n${AGENDAMENTO_LINK}`
                );
                break;

            case '3':
                await chat.sendMessage(
                    `📜 Direito Civil:\n\n` +
                    `Cuidamos de contratos, indenizações e responsabilidade civil.\n\n` +
                    `📌 Agende sua consulta:\n${AGENDAMENTO_LINK}`
                );
                break;

            case '4':
                await chat.sendMessage(
                    `🚔 Direito Criminal:\n\n` +
                    `Atuamos na sua defesa com ética e dedicação em processos criminais.\n\n` +
                    `📌 Agende sua consulta:\n${AGENDAMENTO_LINK}`
                );
                break;

            case '5':
                await chat.sendMessage(
                    `💰 Direito Previdenciário:\n\n` +
                    `Garantimos seus direitos em aposentadorias e benefícios do INSS.\n\n` +
                    `📌 Agende sua consulta:\n${AGENDAMENTO_LINK}`
                );
                break;

            default:
                await chat.sendMessage(
                    `❌ Opção inválida. Por favor, digite apenas o número da opção desejada ou *0* para voltar ao menu.`
                );
                return;
        }

        // Encaminhar CTA adicional
        await chat.sendMessage(
            `✨ Além disso, confira mais conteúdos em nossa rede social: ${SOCIAL_LINK}`
        );

        sessions[from].etapa = 'finalizado';
    }
});

// ============================
// 🌐 SERVIDOR EXPRESS (Render)
// ============================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Chatbot da Dra. Karla Sampaio está online e rodando no Render!');
});

app.listen(PORT, () => {
    console.log(`🌐 Servidor rodando na porta ${PORT}`);
});

// Inicia cliente do WhatsApp
client.initialize();
