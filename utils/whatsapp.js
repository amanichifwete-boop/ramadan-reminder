// utils/whatsapp.js
// Real WhatsApp Business API template sender

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function sendWhatsAppMessage(phoneNumber, templateName, templateParams) {
  const token = process.env.WABA_WHATSAPP_TOKEN;
  const phoneId = process.env.WABA_PHONE_NUMBER_ID;

  if (!phoneNumber || phoneNumber.trim() === "") {
    console.log("❌ Skipping user — missing phone number");
    return { success: false };
  }

  console.log(`📨 Sending WABA template → ${phoneNumber}`);

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: phoneNumber,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en" },
      components: [
        {
          type: "body",
          parameters: templateParams.map((value) => ({
            type: "text",
            text: value,
          })),
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (response.ok) {
    console.log("✅ Sent successfully:", data);
    return { success: true, data };
  } else {
    console.log("❌ Failed to send:", data);
    return { success: false, data };
  }
}

module.exports = { sendWhatsAppMessage };
