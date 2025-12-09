// app.js
// Main runner for Ramadan Reminder automation

const { getSheetData } = require("./utils/google");
const { sendWhatsAppMessage } = require("./utils/whatsapp");

async function main() {
  console.log("Ramadan Reminder automation starting...");

  // 1. Fetch Sheet data (placeholder)
  const users = await getSheetData();
  console.log("Fetched users:", users);

  // 2. Loop through users and send WhatsApp reminder (placeholder)
  for (const user of users) {
    await sendWhatsAppMessage(
      user.phone || "N/A",
      process.env.WABA_TEMPLATE_NAME || "template_name_here",
      ["Ramadan Countdown Placeholder"]
    );
  }

  console.log("Reminder flow completed.");
}

main().catch((err) => {
  console.error("Error running reminder script:", err);
});
