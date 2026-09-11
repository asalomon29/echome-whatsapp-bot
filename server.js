// server.js
// Webhook listo para conectar con WhatsApp. Soporta dos formatos de payload:
//  - Meta WhatsApp Cloud API   (recomendado, gratis para chats iniciados por el cliente)
//  - Twilio WhatsApp Sandbox/API
//
// El mismo cerebro (agent.js) responde sin importar el canal.

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const { generateReply } = require("./agent");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "echome-verify-token";

// ---------------------------------------------------------------------------
// META WHATSAPP CLOUD API
// ---------------------------------------------------------------------------

// Verificación del webhook (Meta la llama una vez al configurar)
app.get("/webhook/meta", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Recepción de mensajes entrantes
app.post("/webhook/meta", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];

    if (!message) {
      // Puede ser un evento de "status" (entregado/leído), lo ignoramos.
      return res.sendStatus(200);
    }

    const from = message.from; // número del cliente
    const text = message.text?.body || "";

    const replyText = await generateReply(from, text);
    await sendMetaMessage(from, replyText);

    res.sendStatus(200);
  } catch (err) {
    console.error("Error en webhook Meta:", err);
    res.sendStatus(500);
  }
});

async function sendMetaMessage(to, body) {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const token = process.env.META_ACCESS_TOKEN;

  await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        text: { body },
      }),
    }
  );
}

// ---------------------------------------------------------------------------
// TWILIO WHATSAPP
// ---------------------------------------------------------------------------

app.post("/webhook/twilio", async (req, res) => {
  try {
    const from = req.body.From; // "whatsapp:+1..."
    const text = req.body.Body || "";

    const replyText = await generateReply(from, text);

    res.set("Content-Type", "text/xml");
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(
        replyText
      )}</Message></Response>`
    );
  } catch (err) {
    console.error("Error en webhook Twilio:", err);
    res.sendStatus(500);
  }
});

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ---------------------------------------------------------------------------

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`EC Home Realty WhatsApp bot escuchando en puerto ${PORT}`);
  console.log(`  - Webhook Meta:   /webhook/meta`);
  console.log(`  - Webhook Twilio: /webhook/twilio`);
});
