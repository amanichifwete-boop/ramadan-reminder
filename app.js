// app.js
// Main runner for Ramadan Reminder automation

const { getSheetData } = require("./utils/google");
const { sendWhatsAppMessage } = require("./utils/whatsapp");
const { formatDate, daysUntilRamadan } = require("./utils/helpers");

async function main() {
  console.log("Ramadan Reminder automation starting...");

  // Today's date
  const today = new Date();
  const formattedDate = formatDate(today);

  // Countdown
  const daysLeft = daysUntilRamadan();
  console.log(`Days until Ramadan: ${daysLeft}`);

  // Fetch Sheet data (placeholder)
  const users = await getSheetData();
  console.log("Fetched users:", users);

  // Loop through users and send WhatsApp reminder
  for (const user of users) {
    await sendWhatsAppMessage(
      user.phone || "N/A",
      process.env.WABA_TEMPLATE_NAME || "template_name_here",
      [
        formattedDate,                   // Example parameter 1
        `${daysLeft} days remaining`     // Example parameter 2
      ]
    );
  }

  console.log("Reminder flow completed.");
}

main().catch((err) => {
  console.error("Error running reminder script:", err);
});
