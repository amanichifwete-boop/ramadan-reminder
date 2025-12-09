// utils/whatsapp.js
// Placeholder for WhatsApp Business API sending logic.

async function sendWhatsAppMessage(phoneNumber, templateName, templateParams) {
  console.log(`WhatsApp placeholder → Sending to: ${phoneNumber}`);
  console.log(`Template: ${templateName}`);
  console.log(`Params:`, templateParams);

  // Real API request will be added here later.
  return { success: true };
}

module.exports = { sendWhatsAppMessage };
