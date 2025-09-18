const qrcode = require('qrcode-terminal');
const QRCode = require('qrcode');
const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');

// Inicializa o cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth()
});

// Armazena o último QR gerado
let latestQr = null;

// Evento de QR Code
client.on('qr', qr => {
    latestQr = qr;
    console.log('=== Escaneie o QR Code abaixo no terminal ===');
    qrcode.generate(qr, { small: true }); // Exibe no terminal
});

// Evento pronto
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// Inicia o cliente
client.initialize();

// Função delay
const delay = ms => new Promise(res => setTimeout(res, ms));

// --- Funil de Atendimento ---
const userStates = {};

// Função para simular digitação e enviar mensagem corretamente
const sendTypingAndMessage = async (chat, message) => {
    const chatId = chat?.id?._serialized;

    try {
        if (!chatId) throw new Error('chatId não encontrado para enviar a mensagem.');

        await chat.sendStateTyping();
        await delay(1200);
        await client.sendMessage(chatId, message);
    } catch (err) {
        console.error('Erro ao enviar mensagem:', err?.message || err);
    } finally {
        try { await chat.clearState(); } catch (e) { }
    }
};

// Handler principal de mensagens
client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        const userNumber = msg.from;
        const rawBody = (msg.body || '').trim();
        const body = rawBody.toLowerCase();

        console.log(`[${new Date().toISOString()}] Mensagem de ${userNumber}: ${rawBody}`);

        // Resetar para o menu
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

        // Sub-menus
        if (userStates[userNumber]) {
            const state = userStates[userNumber];
            const commonAgendamento = 'Perfeito! Para agendar sua consulta, acesse o link: [INSIRA O LINK DE AGENDAMENTO AQUI]\n\nNeste link, você poderá escolher a melhor data e horário para falarmos sobre o seu caso. Aguardamos você!';
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

        // Menu principal
        if (body === '1') {
            await sendTypingAndMessage(chat,
                'Passando por um divórcio ou buscando a guarda dos seus filhos? ...\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'familyLaw';
        } else if (body === '2') {
            await sendTypingAndMessage(chat,
                'Comprou um produto com defeito? ...\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'consumerLaw';
        } else if (body === '3') {
            await sendTypingAndMessage(chat,
                'Você foi demitido sem justa causa? ...\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'laborLaw';
        } else if (body === '4') {
            await sendTypingAndMessage(chat,
                'Comprando um imóvel? ...\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'civilLaw';
        } else if (body === '5') {
            await sendTypingAndMessage(chat,
                'Teve sua aposentadoria negada? ...\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'socialSecurityLaw';
        } else if (body === '6') {
            await sendTypingAndMessage(chat,
                '🚨 **ASSISTÊNCIA JURÍDICA URGENTE** 🚨 ...\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'criminalLaw';
        } else if (body === '7') {
            await sendTypingAndMessage(chat, 'Para outros serviços ou dúvidas, envie sua mensagem e a equipe responderá em breve.');
            userStates[userNumber] = null;
        } else {
            await sendTypingAndMessage(chat, 'Desculpe, não entendi. Digite "menu" para ver as opções novamente.');
        }
    } catch (err) {
        console.error('Erro no handler de mensagem:', err?.message || err);
    }
});

// --- Servidor Express para Render ---
const app = express();
const PORT = process.env.PORT || 3000;

// Rota principal
app.get('/', (req, res) => res.send('Bot da Dra. Karla está rodando!'));

// Rota para exibir QR Code como imagem
app.get('/qr', async (req, res) => {
    if (!latestQr) {
        return res.send('QR Code ainda não gerado. Aguarde o bot iniciar.');
    }
    try {
        const qrImage = await QRCode.toDataURL(latestQr);
        res.send(`<h2>Escaneie o QR Code abaixo no WhatsApp:</h2><img src="${qrImage}"/>`);
    } catch (err) {
        res.status(500).send('Erro ao gerar QR Code.');
    }
});

app.listen(PORT, () => console.log(`Servidor ativo na porta ${PORT}`));
