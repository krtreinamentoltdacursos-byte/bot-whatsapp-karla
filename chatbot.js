const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

let qrCodeData = null;

// ✅ Usa LocalAuth com clientId fixo para manter a sessão
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "bot-karla"
    })
});

// --- QR Code ---
client.on('qr', async qr => {
    qrcodeTerminal.generate(qr, { small: true });
    console.log('QR Code gerado! Escaneie pelo celular.');
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
        const userNumber = msg.from;
        const rawBody = (msg.body || '').trim();
        const body = rawBody.toLowerCase();

        console.log(`[${new Date().toISOString()}] Mensagem de ${userNumber}: ${rawBody}`);

        if (body.match(/\b(menu|0|oi|olá|ola)\b/)) {
            const contact = await msg.getContact();
            const push = contact?.pushname ? contact.pushname.split(" ")[0] : '';
            userStates[userNumber] = null;
            const greeting = `Olá${push ? ', ' + push : ''}! Sou o assistente virtual da Dra. Karla Sampaio. Para qual área do direito você precisa de ajuda hoje?\n\n` +
                `1 - Direito de Família e Sucessões\n` +
                `2 - Direito do Consumidor\n` +
                `3 - Direito Trabalhista\n` +
                `4 - Direito Civil e Imobiliário\n` +
                `5 - Direito Previdenciário\n` +
                `6 - Direito Penal\n` +
                `7 - Outro Serviço\n\n` +
                `Para voltar a este menu, digite "menu" ou "0" a qualquer momento.`;
            await sendTypingAndMessage(chat, greeting);
            return;
        }

        if (userStates[userNumber]) {
            const state = userStates[userNumber];
            const commonAgendamento = 'Perfeito! Para agendar sua consulta, acesse o link: [INSIRA O LINK DE AGENDAMENTO AQUI]';
            const commonMais = 'Para saber mais sobre a área e ler nossos artigos, visite o blog da Dra. Karla Sampaio: [INSIRA O LINK DO BLOG AQUI]';

            if (['familyLaw','consumerLaw','laborLaw','civilLaw','socialSecurityLaw','criminalLaw'].includes(state)) {
                if (body === '1') {
                    await sendTypingAndMessage(chat, commonAgendamento);
                    userStates[userNumber] = null;
                } else if (body === '2') {
                    await sendTypingAndMessage(chat, commonMais);
                    userStates[userNumber] = null;
                } else {
                    await sendTypingAndMessage(chat, 'Opção inválida. Digite "1" para agendar ou "2" para saber mais. Para voltar ao menu digite "menu".');
                }
                return;
            }
        }

        if (body === '1') {
            await sendTypingAndMessage(chat, 'Passando por um divórcio ou buscando a guarda dos seus filhos? ...\n\nDigite **1** para agendar ou **2** para saber mais.');
            userStates[userNumber] = 'familyLaw';
        } else if (body === '2') {
            await sendTypingAndMessage(chat, 'Comprou um produto com defeito? ...\n\nDigite **1** para agendar ou **2** para saber mais.');
            userStates[userNumber] = 'consumerLaw';
        } else if (body === '3') {
            await sendTypingAndMessage(chat, 'Você foi demitido sem justa causa? ...\n\nDigite **1** para agendar ou **2** para saber mais.');
            userStates[userNumber] = 'laborLaw';
        } else if (body === '4') {
            await sendTypingAndMessage(chat, 'Comprando um imóvel? ...\n\nDigite **1** para agendar ou **2** para saber mais.');
            userStates[userNumber] = 'civilLaw';
        } else if (body === '5') {
            await sendTypingAndMessage(chat, 'Teve sua aposentadoria negada? ...\n\nDigite **1** para agendar ou **2** para saber mais.');
            userStates[userNumber] = 'socialSecurityLaw';
        } else if (body === '6') {
            await sendTypingAndMessage(chat, '🚨 **ASSISTÊNCIA JURÍDICA URGENTE** 🚨 ...\n\nDigite **1** para agendar ou **2** para saber mais.');
            userStates[userNumber] = 'criminalLaw';
        } else if (body === '7') {
            await sendTypingAndMessage(chat, 'Para outros serviços ou dúvidas, envie sua mensagem e a equipe responderá em breve.');
            userStates[userNumber] = null;
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

// --- Mantém o Render ativo ---
setInterval(() => {
    fetch(`https://bot-whatsapp-karla.onrender.com/`).catch(() => {});
}, 14 * 60 * 1000);

app.listen(PORT, () => console.log(`Servidor ativo na porta ${PORT}`));
