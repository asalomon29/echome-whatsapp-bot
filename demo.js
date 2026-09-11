// demo.js
// Chat de prueba por terminal para validar el flujo del agente SIN necesitar
// todavía credenciales de WhatsApp. Usa el mismo cerebro que el webhook real.
//
// Uso:
//   ANTHROPIC_API_KEY=sk-ant-... node demo.js

require("dotenv").config();
const readline = require("readline");
const { generateReply } = require("./agent");

const PHONE = "demo-user";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("=== Demo: Agente de WhatsApp de EC Home Realty ===");
console.log("Escribe como si fueras un cliente por WhatsApp. Ctrl+C para salir.\n");

async function askAndReply(promptText) {
  return new Promise((resolve) => {
    rl.question(promptText, resolve);
  });
}

async function main() {
  // Simula el primer mensaje automático que el cliente ve al escanear el QR
  console.log(
    "Alex (bot): ¡Hola! 👋 Soy Alex, del equipo de EC Home Realty. ¿Estás buscando comprar, vender o invertir en una propiedad?\n"
  );

  while (true) {
    const userText = await askAndReply("Tú: ");
    if (!userText.trim()) continue;

    const reply = await generateReply(PHONE, userText);
    console.log(`\nAlex (bot): ${reply}\n`);
  }
}

main();
