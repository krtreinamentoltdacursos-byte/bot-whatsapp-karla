const express = require("express");
const qrcode = require("qrcode");
const { Client, LocalAuth } = require("whatsapp-web.js");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 Sessões e timers por usuário
let sessions = {};
let timers = {};
const TEMPO_INATIVIDADE = 5; // minutos

// 🔹 Variável global para guardar o QR
global.qrCode = null;

// =============================
// Início do cliente WhatsApp
// =============================
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-karla" }),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", async (qr) => {
  console.log("QR Code gerado!");
  global.qrCode = await qrcode.toDataURL(qr); // transforma em base64
});

client.on("ready", () => {
  console.log("🤖 Bot WhatsApp está pronto!");
});

client.on("message", async (msg) => {
  const from = msg.from;

  if (!sessions[from]) {
    sessions[from] = { etapa: "inicio" };
    await msg.reply(
      "👋 Olá, você está falando com o *Assistente Virtual exclusivo* da Dra. Karla Sampaio.\n\n" +
      "📌 Escolha a área do Direito que deseja atendimento:\n\n" +
      "1️⃣ Direito de Família\n" +
      "2️⃣ Direito do Consumidor\n" +
      "3️⃣ Direito Trabalhista\n" +
      "4️⃣ Direito Previdenciário\n" +
      "5️⃣ Direito Civil\n\n" +
      "➡️ Digite o número da opção desejada.\n\n" +
      "🔄 Digite *menu* a qualquer momento para voltar ao início."
    );
    return;
  }

  // Reiniciar menu
  if (msg.body.toLowerCase() === "menu") {
    sessions[from] = { etapa: "inicio" };
    await msg.reply(
      "📌 Voltamos ao menu inicial:\n\n" +
      "1️⃣ Direito de Família\n" +
      "2️⃣ Direito do Consumidor\n" +
      "3️⃣ Direito Trabalhista\n" +
      "4️⃣ Direito Previdenciário\n" +
      "5️⃣ Direito Civil\n\n" +
      "➡️ Digite o número da opção desejada."
    );
    return;
  }

  switch (sessions[from].etapa) {
    case "inicio":
      switch (msg.body) {
        case "1":
          await msg.reply(
            "👨‍👩‍👧 Direito de Família trata de divórcio, pensão alimentícia, guarda dos filhos e mais.\n\n" +
            "👉 Deseja *agendar uma consulta online de 50 minutos* pelo Google Meet?\n" +
            "Clique aqui: https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
            "📲 Ou saiba mais em nossa rede social: www.tiktok.com/@_karlasampaio_"
          );
          break;
        case "2":
          await msg.reply(
            "🛒 Direito do Consumidor protege você contra cobranças indevidas, golpes, problemas com bancos e empresas.\n\n" +
            "👉 Agende sua consulta online: https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
            "📲 Saiba mais em: www.tiktok.com/@_karlasampaio_"
          );
          break;
        case "3":
          await msg.reply(
            "💼 Direito Trabalhista: rescisões, direitos não pagos, justa causa, assédio, verbas trabalhistas.\n\n" +
            "👉 Marque sua consulta: https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
            "📲 Conteúdos em: www.tiktok.com/@_karlasampaio_"
          );
          break;
        case "4":
          await msg.reply(
            "👵 Direito Previdenciário: aposentadoria, benefícios negados, INSS, revisões.\n\n" +
            "👉 Agende já: https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
            "📲 Saiba mais: www.tiktok.com/@_karlasampaio_"
          );
          break;
        case "5":
          await msg.reply(
            "⚖️ Direito Civil: contratos, indenizações, imóveis, dívidas, execuções.\n\n" +
            "👉 Clique para consulta: https://calendar.app.google/SfBNgXZHyH429Yhy6\n\n" +
            "📲 Mais informações: www.tiktok.com/@_karlasampaio_"
          );
          break;
        default:
          await msg.reply("❌ Opção inválida. Digite um número de 1 a 5 ou *menu* para reiniciar.");
          return;
      }

      sessions[from].etapa = "atendimento";
      break;

    case "atendimento":
      await msg.reply("✅ Atendimento em andamento. Digite *menu* para voltar ao início.");
      break;
  }

  // 🔹 Timer de inatividade
  if (timers[from]) clearTimeout(timers[from]);
  timers[from] = setTimeout(async () => {
    await msg.reply("⌛ Atendimento encerrado por inatividade. Digite *oi* para começar novamente.");
    delete sessions[from];
    delete timers[from];
  }, TEMPO_INATIVIDADE * 60 * 1000);
});

// =============================
// Servidor Express
// =============================
app.get("/", (req, res) => {
  res.send("🤖 Chatbot da Dra. Karla Sampaio está rodando!");
});

// 🔹 Rota para exibir o QR Code
app.get("/qrcode", (req, res) => {
  if (global.qrCode) {
    res.send(`<h2>Escaneie o QR Code abaixo:</h2><img src="${global.qrCode}" />`);
  } else {
    res.send("⏳ QR Code ainda não gerado. Aguarde...");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

client.initialize();
