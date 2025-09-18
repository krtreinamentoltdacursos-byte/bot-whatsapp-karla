// bot-whatsapp.js
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

// leitura QR
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
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
    // obtém chatId serializado (string) que o client.sendMessage requer
    const chatId = chat && chat.id && chat.id._serialized ? chat.id._serialized : null;

    try {
        if (!chatId) throw new Error('chatId não encontrado para enviar a mensagem.');

        // inicia "digitando"
        await chat.sendStateTyping();
        await delay(1200); // pausa simulando digitação
        // envia a mensagem (usa chatId serializado)
        await client.sendMessage(chatId, message);
    } catch (err) {
        console.error('Erro ao enviar mensagem:', err && err.message ? err.message : err);
    } finally {
        // garante que o status de digitação seja limpo
        try { await chat.clearState(); } catch (e) { /* ignora */ }
    }
};

// Handler principal de mensagens
client.on('message', async msg => {
    try {
        const chat = await msg.getChat();
        const userNumber = msg.from; // ex: '5511999999999@c.us'
        const rawBody = (msg.body || '').trim();
        const body = rawBody.toLowerCase();

        console.log(`[${new Date().toISOString()}] Mensagem de ${userNumber}: ${rawBody}`);

        // Se o usuário pedir o menu (ou 0) — reset do estado
        if (body.match(/\b(menu|0|oi|olá|ola)\b/)) {
            const contact = await msg.getContact();
            const push = contact && contact.pushname ? contact.pushname.split(" ")[0] : '';
            userStates[userNumber] = null;
            const greeting = `Olá${push ? ', ' + push : ''}! Sou o assistente virtual da Dra. Karla Sampaio. Para qual área do direito você precisa de ajuda hoje? Por favor, digite a opção desejada:\n\n` +
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

        // Se o usuário estiver em um sub-menu (estado)
        if (userStates[userNumber]) {
            const state = userStates[userNumber];

            const commonAgendamento = 'Perfeito! Para agendar sua consulta, acesse o link: [INSIRA O LINK DE AGENDAMENTO AQUI]\n\nNeste link, você poderá escolher a melhor data e horário para falarmos sobre o seu caso. Aguardamos você!';
            const commonMais = 'Para saber mais sobre a área e ler nossos artigos, visite o blog da Dra. Karla Sampaio: [INSIRA O LINK DO BLOG AQUI]';

            // estados comuns para todos os sub-menus
            if (['familyLaw','consumerLaw','laborLaw','civilLaw','socialSecurityLaw','criminalLaw'].includes(state)) {
                if (body === '1') {
                    await sendTypingAndMessage(chat, commonAgendamento);
                    userStates[userNumber] = null;
                } else if (body === '2') {
                    await sendTypingAndMessage(chat, commonMais);
                    userStates[userNumber] = null;
                } else {
                    await sendTypingAndMessage(chat, 'Opção inválida. Por favor, digite "1" para agendar ou "2" para saber mais. Para voltar ao menu digite "menu".');
                }
                return;
            }
        }

        // Menu principal — sem estado
        if (body === '1') {
            await sendTypingAndMessage(chat,
                'Passando por um divórcio ou buscando a guarda dos seus filhos? Em momentos delicados como esses, um bom suporte jurídico faz toda a diferença.\n\n' +
                'Nossa consulta inicial, no valor de R$ 100,00, serve para entendermos seu caso e traçar o melhor caminho. E o melhor: **esse valor será totalmente abatido** se você optar por fechar o contrato de serviços conosco.\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais sobre como podemos ajudar, digite **2**.'
            );
            userStates[userNumber] = 'familyLaw';
        } else if (body === '2') {
            await sendTypingAndMessage(chat,
                'Comprou um produto com defeito? Teve um serviço mal prestado e não sabe o que fazer? O Direito do Consumidor é o seu aliado nessas horas.\n\n' +
                'Com uma consulta de apenas R$ 100,00, a Dra. Karla Sampaio analisa seu caso e te orienta sobre os próximos passos. E se você decidir entrar com a ação, **o valor da consulta será descontado** dos nossos honorários.\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'consumerLaw';
        } else if (body === '3') {
            await sendTypingAndMessage(chat,
                'Você foi demitido sem justa causa? Ou tem dúvidas sobre suas horas extras e férias? A Dra. Karla está aqui para garantir que seus direitos trabalhistas sejam respeitados.\n\n' +
                'Agende uma consulta online por R$ 100,00 e tenha uma análise completa do seu caso. Se o seu processo avançar, **o valor da consulta será abatido** do valor final do contrato.\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'laborLaw';
        } else if (body === '4') {
            await sendTypingAndMessage(chat,
                'Comprando um imóvel? Ou precisa resolver um problema com um contrato de aluguel? Questões cíveis e imobiliárias exigem atenção e conhecimento para evitar dores de cabeça.\n\n' +
                'Nossa consulta de R$ 100,00 é o primeiro passo para a sua segurança. Caso você feche o contrato com a gente, **o valor da consulta será totalmente descontado**.\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'civilLaw';
        } else if (body === '5') {
            await sendTypingAndMessage(chat,
                'Teve sua aposentadoria negada ou está com dúvidas sobre um benefício do INSS? Não se preocupe, o Direito Previdenciário pode ajudar a reverter essa situação e garantir o que é seu por direito.\n\n' +
                'Agende uma consulta por R$ 100,00 e obtenha uma análise detalhada do seu benefício. E se você contratar nossos serviços, **o valor da consulta será abatido**.\n\n' +
                'Para agendar sua consulta, digite **1**.\n' +
                'Para saber mais, digite **2**.'
            );
            userStates[userNumber] = 'socialSecurityLaw';
        } else if (body === '6') {
            await sendTypingAndMessage(chat,
                '🚨 **ASSISTÊNCIA JURÍDICA URGENTE** 🚨\n\n' +
                'Em um momento de crise, cada segundo conta. Se você ou alguém que você conhece foi detido, é vital agir imediatamente.\n\n' +
                'Nossa equipe está pronta para uma consulta de urgência para entender o caso. O valor da consulta, R$ 100,00, é para garantir o atendimento rápido e especializado, e **será abatido** dos honorários caso o contrato seja fechado.\n\n' +
                'Para agendar sua consulta de urgência agora mesmo, digite **1**.\n' +
                'Para saber mais sobre nossos serviços, digite **2**.'
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