const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = null;

// ✅ Inicializa client ANTES de usar
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "bot-karla"
    })
});

// --- QR Code ---
client.on('qr', async qr => {
    console.log('📱 QR Code gerado! Acesse a URL do seu bot com "/qrcode" no final.');
    qrCodeData = await qrcode.toDataURL(qr);
});

// --- Quando conectar ---
client.on('ready', () => {
    console.log('✅ WhatsApp conectado!');
    qrCodeData = null;
});

// --- Se desconectar, tenta reconectar ---
client.on('disconnected', (reason) => {
    console.log('❌ Cliente desconectado:', reason);
    console.log('🔄 Tentando reconectar...');
    client.initialize();
});

// Inicializa cliente
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

// --- Funil de Atendimento ---
const userStates = {};

const sendTypingAndMessage = async (chat, message) => {
    const chatId = chat?.id?._serialized || null;

    try {
        if (!chatId) throw new Error('chatId não encontrado para enviar a mensagem.');
        await chat.sendStateTyping();
        await delay(1200);
        await client.sendMessage(chatId, message);
    } catch (err) {
        console.error('Erro ao enviar mensagem:', err.message || err);
    } finally {
        try { await chat.clearState(); } catch (e) {}
    }
};

client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        const chatId = chat.id._serialized; // 🔑 identificador único do chat
        const rawBody = (msg.body || '').trim();
        const body = rawBody.toLowerCase();

        console.log(`[${new Date().toISOString()}] Mensagem de ${chatId}: ${rawBody}`);

        // --- Menu inicial ---
        if (body.match(/\b(menu|0|oi|olá|ola|boa noite|bom dia|boa tarde|tudo bem|pode me ajudar)\b/)) {
            const contact = await msg.getContact();
            const push = contact?.pushname ? contact.pushname.split(" ")[0] : '';
            userStates[chatId] = null;
            const greeting = `Olá${push ? ', ' + push : ''}! Sou o assistente virtual da Dra. Karla Sampaio, sua parceira jurídica para os momentos mais importantes da vida. Entendo que cada situação é única e merece atenção especializada.\n\nPara qual área do direito você busca orientação hoje?` +
                `\n\n1 - Direito de Família e Sucessões: Para quem busca apoio em momentos de mudança familiar.` +
                `\n2 - Direito do Consumidor: Seus direitos como consumidor são inegociáveis.` +
                `\n3 - Direito Trabalhista: Garantindo um ambiente de trabalho justo e seguro.` +
                `\n4 - Direito Civil e Imobiliário: Segurança e clareza nas suas relações e propriedades.` +
                `\n5 - Direito Previdenciário: Seus direitos à aposentadoria e benefícios sociais.` +
                `\n6 - Direito Penal: Defesa e orientação em momentos críticos.` +
                `\n7 - Outro Serviço: Para necessidades jurídicas específicas.\n\n` +
                `Basta digitar o número da opção desejada. Para voltar a este menu, digite "menu" ou "0" a qualquer momento.`;
            await sendTypingAndMessage(chat, greeting);
            return;
        }

        // --- Estados intermediários (submenu agendar/saber mais) ---
        if (userStates[chatId]) {
            const state = userStates[chatId];
            const commonAgendamento = 'Perfeito! Para agendar sua consulta e dar o primeiro passo rumo à solução, acesse o link: [INSIRA O LINK DE AGENDAMENTO AQUI]. A Dra. Karla está pronta para te ouvir.';
            const commonMais = 'Para saber mais sobre a área e ter acesso a conteúdos exclusivos que podem te ajudar, visite o blog da Dra. Karla Sampaio: [INSIRA O LINK DO BLOG AQUI]. Conhecimento é poder!';

            if (['familyLaw','consumerLaw','laborLaw','civilLaw','socialSecurityLaw','criminalLaw'].includes(state)) {
                if (body === '1') {
                    await sendTypingAndMessage(chat, commonAgendamento);
                    userStates[chatId] = null;
                } else if (body === '2') {
                    await sendTypingAndMessage(chat, commonMais);
                    userStates[chatId] = null;
                } else {
                    await sendTypingAndMessage(chat, 'Opção inválida. Digite "1" para agendar ou "2" para saber mais. Para voltar ao menu digite "menu".');
                }
                return;
            }
        }

        // --- Fluxo principal ---
        if (body === '1') {
            await sendTypingAndMessage(chat, 'Momentos de mudança na família podem ser delicados...');
            userStates[chatId] = 'familyLaw';
        } else if (body === '2') {
            await sendTypingAndMessage(chat, 'Comprou um produto com defeito...');
            userStates[chatId] = 'consumerLaw';
        } else if (body === '3') {
            await sendTypingAndMessage(chat, 'Você foi demitido(a) sem justa causa...');
            userStates[chatId] = 'laborLaw';
        } else if (body === '4') {
            await sendTypingAndMessage(chat, 'Comprando ou vendendo um imóvel?...');
            userStates[chatId] = 'civilLaw';
        } else if (body === '5') {
            await sendTypingAndMessage(chat, 'Teve sua aposentadoria negada...');
            userStates[chatId] = 'socialSecurityLaw';
        } else if (body === '6') {
            await sendTypingAndMessage(chat, '🚨 **ASSISTÊNCIA JURÍDICA URGENTE** 🚨 Em momentos de crise...');
            userStates[chatId] = 'criminalLaw';
        } else if (body === '7') {
            await sendTypingAndMessage(chat, 'Para outros serviços ou dúvidas...');
            userStates[chatId] = null;
        } else {
            await sendTypingAndMessage(chat, 'Desculpe, não entendi. Digite "menu" para ver as opções novamente.');
        }
    } catch (err) {
        console.error('Erro no handler de mensagem:', err.message || err);
    }
});

// --- Servidor Express ---
app.get('/', (req, res) => res.send('🤖 Bot da Dra. Karla está rodando!'));

app.get('/qrcode', (req, res) => {
    if (!qrCodeData) {
        return res.send('✅ WhatsApp já conectado ou QR ainda não gerado. Verifique os logs.');
    }
    res.send(`<h1>Escaneie o QR Code</h1><img src="${qrCodeData}" />`);
});

app.listen(PORT, () => console.log(`🚀 Servidor ativo na porta ${PORT}`));
