const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const app = express();
const port = process.env.PORT || 3000;

// 🚀 Rota básica (Render precisa de uma URL pública)
app.get("/", (req, res) => {
  res.send("🤖 Bot Jurídico WhatsApp rodando!");
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// 🔐 Inicializa o cliente WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// Exibe QR Code no terminal
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("📲 Escaneie o QR Code acima para conectar seu WhatsApp");
});

// Confirma que está pronto
client.on("ready", () => {
  console.log("✅ Bot conectado e pronto para uso!");
});

// ===========================
// 🔄 Controle de fluxo por cliente
// ===========================
let etapas = {}; // { numero: etapa }
let timers = {}; // { numero: timeout }

// Função para encerrar o contato por inatividade
function encerrarContato(numero, chat) {
  chat.sendMessage(
    "⏳ Como não tivemos mais retorno, estamos encerrando este atendimento.\n\n" +
    "👉 Quando desejar, pode nos chamar novamente.\n" +
    "📌 Lembre-se: agende sua consulta de 50 minutos pelo Meet:\n" +
    "🔗 https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
    "A *Dra. Karla Sampaio* e sua equipe estarão prontas para ajudar você. ⚖️"
  );
  etapas[numero] = 0; // volta ao estado inicial
  delete timers[numero]; // limpa o timer
}

// Automação principal
client.on("message", async (msg) => {
  const from = msg.from; // Número do cliente
  const chat = await msg.getChat();

  // Resetar timer sempre que o cliente falar
  if (timers[from]) {
    clearTimeout(timers[from]);
  }
  timers[from] = setTimeout(() => encerrarContato(from, chat), 15 * 60 * 1000); // 15 min

  if (!etapas[from]) {
    etapas[from] = 0; // etapa inicial
  }

  // =====================
  // Etapa 0 → Mensagem inicial
  // =====================
  if (etapas[from] === 0) {
    await msg.reply(
      "👋 Olá! Seja bem-vindo(a).\n\n" +
      "Sou o assistente jurídico da *Dra. Karla Sampaio*.\n\n" +
      "Escolha uma das áreas em que deseja atendimento:\n\n" +
      "1️⃣ Direito de Família 👨‍👩‍👧\n" +
      "2️⃣ Direito Trabalhista ⚖️\n" +
      "3️⃣ Direito Previdenciário 👵\n" +
      "4️⃣ Direito Civil 🏛️\n" +
      "5️⃣ Direito Criminal 🚨\n\n" +
      "Ou digite *6* para saber mais sobre nosso trabalho. 📲"
    );
    etapas[from] = 1;
  }

  // =====================
  // Etapa 1 → Escolha da área
  // =====================
  else if (etapas[from] === 1) {
    switch (msg.body) {
      case "1":
        await msg.reply(
          "👨‍👩‍👧 Você escolheu *Direito de Família*.\n\n" +
          "Auxiliamos em divórcios, pensão alimentícia, guarda de filhos e partilha de bens.\n\n" +
          "👉 Para agendar uma consulta estratégica de *50 minutos pelo Google Meet*, clique no link abaixo:\n" +
          "🔗 https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
          "✅ Essa consulta é o primeiro passo para resolver sua questão com segurança."
        );
        etapas[from] = 0;
        break;

      case "2":
        await msg.reply(
          "⚖️ Você escolheu *Direito Trabalhista*.\n\n" +
          "Atuamos em causas de rescisão, verbas trabalhistas, assédio moral e direitos não pagos.\n\n" +
          "👉 Agende sua consulta estratégica de *50 minutos pelo Google Meet*:\n" +
          "🔗 https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
          "🔒 Tenha seus direitos garantidos com segurança jurídica."
        );
        etapas[from] = 0;
        break;

      case "3":
        await msg.reply(
          "👵 Você escolheu *Direito Previdenciário*.\n\n" +
          "Ajudamos em aposentadorias, revisões de benefícios, auxílio-doença e pensões.\n\n" +
          "👉 Reserve sua consulta estratégica de *50 minutos pelo Google Meet*:\n" +
          "🔗 https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
          "✅ Tenha clareza sobre seu direito e os próximos passos."
        );
        etapas[from] = 0;
        break;

      case "4":
        await msg.reply(
          "🏛️ Você escolheu *Direito Civil*.\n\n" +
          "Cuidamos de contratos, indenizações, dívidas e demais litígios cíveis.\n\n" +
          "👉 Agende sua consulta estratégica de *50 minutos pelo Google Meet*:\n" +
          "🔗 https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
          "📌 Invista em orientação jurídica antes de tomar decisões importantes."
        );
        etapas[from] = 0;
        break;

      case "5":
        await msg.reply(
          "🚨 Você escolheu *Direito Criminal*.\n\n" +
          "Oferecemos defesa técnica em investigações, audiências e processos criminais.\n\n" +
          "👉 Marque sua consulta estratégica de *50 minutos pelo Google Meet*:\n" +
          "🔗 https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
          "⚖️ Sua liberdade e seus direitos merecem atenção imediata."
        );
        etapas[from] = 0;
        break;

      case "6":
        await msg.reply(
          "📲 Para saber mais sobre nosso trabalho e conteúdos exclusivos,\n" +
          "acesse nossa rede social no TikTok:\n" +
          "🔗 www.tiktok.com/@_karlasampaio_"
        );
        etapas[from] = 0;
        break;

      default:
        await msg.reply(
          "❌ Opção inválida. Por favor, escolha uma das opções do menu inicial."
        );
        etapas[from] = 1;
    }
  }
});

// Inicia o cliente
client.initialize();
