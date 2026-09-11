// agent.js
// Núcleo del "cerebro" del agente: arma el prompt con la persona + base de
// conocimiento de EC Home Realty y llama al modelo para generar la respuesta.
// Independiente del canal (WhatsApp, demo CLI, etc.) para que sea fácil de
// conectar a Meta Cloud API o a Twilio más adelante.

const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(__dirname, "system_prompt.md"),
  "utf-8"
);
const KNOWLEDGE_BASE = fs.readFileSync(
  path.join(__dirname, "knowledge_base.md"),
  "utf-8"
);

const FULL_SYSTEM = `${SYSTEM_PROMPT}\n\n---\n\n# knowledge_base.md\n\n${KNOWLEDGE_BASE}`;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Historial de conversación en memoria, por número de teléfono.
// En producción esto debería vivir en una base de datos (Redis/Postgres)
// para sobrevivir reinicios y escalar entre varias instancias del servidor.
const conversations = new Map();

function getHistory(phoneNumber) {
  if (!conversations.has(phoneNumber)) {
    conversations.set(phoneNumber, []);
  }
  return conversations.get(phoneNumber);
}

async function generateReply(phoneNumber, incomingText) {
  const history = getHistory(phoneNumber);
  history.push({ role: "user", content: incomingText });

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 400,
    system: FULL_SYSTEM,
    messages: history,
  });

  const replyText = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  history.push({ role: "assistant", content: replyText });

  // Evita que el historial crezca sin límite
  if (history.length > 20) {
    history.splice(0, history.length - 20);
  }

  return replyText;
}

module.exports = { generateReply };
