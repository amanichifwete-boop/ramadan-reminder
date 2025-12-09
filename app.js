// app.js
// Main automation runner for Ramadan Reminder

const { getSheetData } = require("./utils/google");
const { sendWhatsAppMessage } = require("./utils/whatsapp");
const { formatDate, daysUntilRamadan, getHijriDate } = require("./utils/helpers");

async function main() {
  console.log("🚀 Ramadan Reminder automation starting...");

  // Today's dates
  const today = new Date();
  const gregorianDate = formatDate(today);
  const hijriDate = getHijriDate();

  // Countdown calculation
  const daysLeft = daysUntilRamadan();

  // Fetch Sheet rows
  const users = await getSheetData();

  console.log(`📄 ${users.length} total entries found in sheet.`);

  // Filter users who opted in
  const recipients = users.filter(
    (u) => u.opt_in_status.trim().toUpperCase() === "YES"
  );

  console.log(`📬 ${recipients.length} recipients will receive reminders.`);

  // Loop and send messages
  for (const user of recipients) {
    const params = [
      user.full_name,       // {{1}} User Name
      gregorianDate,        // {{2}} Gregorian Date
      hijriDate,            // {{3}} Hijri Date
      `${daysLeft}`         // {{4}} Days Remaining
    ];

    console.log(`\n➡️ Sending reminder to: ${user.full_name} (${user.phone})`);

    const result = await sendWhatsAppMessage(
      user.phone,
      process.env.WABA_TEMPLATE_NAME,
      params
    );

    if (result.success) {
      console.log(`✅ Reminder sent to ${user.full_name}`);
    } else {
      console.log(`❌ Failed for ${user.full_name}`);
    }
  }

  console.log("\n🎉 All messages processed.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
});
