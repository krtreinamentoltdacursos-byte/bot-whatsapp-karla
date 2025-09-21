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
            userStates[chatId] = null; // 👉 usa chatId em vez de userNumber
            const greeting = `Olá${push ? ', ' + push : ''}! Sou o assistente virtual da Dra. Karla Sampaio, sua parceira jurídica...` +
                `\n\n1 - Direito de Família e Sucessões...` +
                `\n6 - Direito Penal...` +
                `\n7 - Outro Serviço...`;
            await sendTypingAndMessage(chat, greeting);
            return;
        }

        // --- Estados intermediários ---
        if (userStates[chatId]) {
            const state = userStates[chatId];
            const commonAgendamento = 'Perfeito! Para agendar sua consulta...';
            const commonMais = 'Para saber mais...';

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
            await sendTypingAndMessage(chat, 'Momentos de mudança na família...');
            userStates[chatId] = 'familyLaw';
        } else if (body === '2') {
            await sendTypingAndMessage(chat, 'Comprou um produto com defeito...');
            userStates[chatId] = 'consumerLaw';
        } else if (body === '3') {
            await sendTypingAndMessage(chat, 'Você foi demitido...');
            userStates[chatId] = 'laborLaw';
        } else if (body === '4') {
            await sendTypingAndMessage(chat, 'Comprando ou vendendo um imóvel?...');
            userStates[chatId] = 'civilLaw';
        } else if (body === '5') {
            await sendTypingAndMessage(chat, 'Teve sua aposentadoria negada...');
            userStates[chatId] = 'socialSecurityLaw';
        } else if (body === '6') {
            await sendTypingAndMessage(chat, '🚨 **ASSISTÊNCIA JURÍDICA URGENTE** 🚨...');
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
