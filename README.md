# Bot de WhatsApp — EC Home Realty (prototipo)

Prototipo de agente conversacional para `echomerealty.com`. Responde por WhatsApp
como si fuera un agente inmobiliario real del equipo: saluda, califica al
cliente (compra/venta/renta/inversión, zona, presupuesto) y recolecta sus
datos para que un Realtor® humano le dé seguimiento — igual que hace el
formulario de contacto del sitio web.

## Estructura

```
knowledge_base.md   → Datos reales de la empresa (extraídos de echomerealty.com)
system_prompt.md    → Personalidad y reglas del agente "Alex"
agent.js            → Cerebro: arma el prompt y llama al modelo (Claude)
server.js           → Webhook HTTP: conecta con Meta WhatsApp Cloud API o Twilio
demo.js             → Chat de prueba por terminal (sin necesitar WhatsApp real)
whatsapp_qr.png     → Código QR de ejemplo que abre un chat de WhatsApp
```

## 1. Probar el flujo de conversación (sin WhatsApp todavía)

```bash
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # tu clave de la API de Claude
npm run demo
```

Esto abre un chat por terminal donde puedes escribir como si fueras un
cliente y ver cómo responde "Alex", el agente virtual, usando la
información real de EC Home Realty.

## 2. Conectar con WhatsApp de verdad

Necesitas UNA de estas dos opciones:

### Opción A — Meta WhatsApp Cloud API (recomendado)
- Gratis para conversaciones iniciadas por el cliente (las primeras 1,000/mes también gratis en general).
- Requiere: cuenta de Meta for Developers, un número de WhatsApp Business verificado (puede ser el mismo +1 786 314 2567 o uno nuevo), y configurar el webhook `/webhook/meta` con un dominio público (por ejemplo, desplegando este servidor en Render, Railway o un VPS).
- Pasos resumidos:
  1. Crear una app en developers.facebook.com → producto "WhatsApp".
  2. Copiar `META_ACCESS_TOKEN` y `META_PHONE_NUMBER_ID` al archivo `.env`.
  3. Desplegar `server.js` en un servidor con URL pública (HTTPS).
  4. En Meta, configurar el webhook apuntando a `https://tu-dominio.com/webhook/meta` con el mismo `WHATSAPP_VERIFY_TOKEN` del `.env`.

### Opción B — Twilio (más rápido para probar)
- Tiene un "Sandbox de WhatsApp" gratuito para pruebas en minutos, luego cobra por mensaje en producción.
- Pasos resumidos:
  1. Crear cuenta en twilio.com → activar WhatsApp Sandbox.
  2. Configurar el webhook "WHEN A MESSAGE COMES IN" apuntando a `https://tu-dominio.com/webhook/twilio`.
  3. Desplegar `server.js` con una URL pública.

## 3. El código QR

`whatsapp_qr.png` es un ejemplo generado con un número de marcador de
posición. En cuanto tengas el número de WhatsApp Business definitivo,
regenera el QR (instrucciones abajo) y colócalo en la página web o en
materiales impresos — al escanearlo, el visitante abre WhatsApp con un
mensaje inicial ya escrito, lo que dispara automáticamente la respuesta
del bot.

## 4. Siguientes pasos sugeridos

- Definir el número de WhatsApp Business definitivo de EC Home Realty.
- Decidir Meta Cloud API vs Twilio (ver comparación en el mensaje de resumen).
- Desplegar `server.js` en un hosting con HTTPS (Render/Railway/Fly.io funcionan bien para esto).
- Conectar el envío de datos capturados (nombre/email/teléfono) al CRM o al mismo sistema Round-Robin que ya usa la empresa, en vez de solo mostrarlos en el chat.
- Añadir handoff a un humano cuando el cliente lo pida explícitamente.
