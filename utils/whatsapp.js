// utils/whatsapp.js
// Safe WhatsApp sender with retries + backoff

const axios = require("axios");

async function sendWhatsAppMessage(phone, templateName, params) {
  const token = process.env.WABA_WHATSAPP_TOKEN;
  const phoneId = process.env.WABA_PHONE_NUMBER_ID;

  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: params.map((p) => ({ type: "text", text: p })),
        },
      ],
    },
  };

  const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      attempt++;
      console.log(`📨 Attempt ${attempt} → sending to ${phone}`);

      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // If Meta returns success
      return { success: true, response: response.data };

    } catch (err) {
      console.log(`⚠️ Send failed (attempt ${attempt}):`, err?.response?.data || err.message);

      if (attempt >= maxAttempts) {
        // After maximum attempts, fail permanently
        return { success: false, error: err?.response?.data || err.message };
      }

      // Exponential backoff: wait 1s → 2s → 4s
      const wait = 1000 * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${wait / 1000}s before retrying...`);
      await new Promise((res) => setTimeout(res, wait));
    }
  }
}

module.exports = { sendWhatsAppMessage };
