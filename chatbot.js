const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

// leitura QR
client.on('qr', qr => {
    // A correção para o QR Code distorcido está aqui
    // Em vez de gerar a imagem no terminal, vamos imprimir o texto Base64
    // Você vai copiar esse texto e colá-lo em um site para ver a imagem do QR Code
    console.log('QR Code Base64:', qr);
});

// pronto
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

// inicializa
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

// --- Funil de Atendimento ---
// Armazena estado por usuário
const userStates = {};

// Função para simular digitação e enviar mensagem corretamente
const sendTypingAndMessage = async (chat, message) => {
    const chatId = chat && chat.id && chat.id._serialized ? chat.id._serialized : null;

    try {
        if (!chatId) throw new Error('chatId não encontrado para enviar a mensagem.');

        // inicia "digitando"
        await chat.sendStateTyping();
        await delay(1200);
        await client.sendMessage(chatId, message);
    } catch (err) {
        console.error('Erro ao enviar mensagem:', err && err.message ? err.message : err);
    } finally {
        try { await chat.clearState(); } catch (e) { /* ignora */ }
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
            const push = contact && contact.pushname ? contact.pushname.split(" ")[0] : '';
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
        console.error('Erro no handler de mensagem:', err && err.message ? err.message : err);
    }
});

// --- Servidor para Render (plano gratuito) ---
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot da Dra. Karla está rodando!'));
app.listen(PORT, () => console.log(`Servidor ativo na porta ${PORT}`));
