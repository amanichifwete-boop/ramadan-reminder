// app.js
// Main automation runner for Ramadan Reminder

const { getSheetData, updateDeliveryStatus } = require("./utils/google");
const { sendWhatsAppMessage } = require("./utils/whatsapp");
const { formatDate, daysUntilRamadan, getHijriDate } = require("./utils/helpers");

// -----------------------------
// 🔥 DRY RUN CONTROL
// -----------------------------
// Set DRY_RUN=true in GitHub secrets to test without sending
const DRY_RUN = process.env.DRY_RUN === "true";

// -----------------------------
// Normalize Kenyan phone numbers
// -----------------------------
function normalizePhone(raw) {
  if (!raw && raw !== 0) return null;
  let s = String(raw).trim();

  s = s.replace(/[\s\-()]/g, ""); // remove spaces/dashes/brackets
  if (s.startsWith("+")) s = s.slice(1); // remove leading +

  if (/^0\d+/.test(s)) s = "254" + s.slice(1);     // 0740... → 254740...
  if (/^7\d{8}$/.test(s)) s = "254" + s;            // 7XXXXXXXX → 2547XXXXXXXX
  if (/^1\d{8}$/.test(s)) s = "254" + s;            // 1XXXXXXXX → 2541XXXXXXXX

  const kenyaRegex = /^254(?:7|1)\d{8}$/;
  return kenyaRegex.test(s) ? s : null;
}

// -----------------------------
// Helper wait (throttling)
// -----------------------------
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// -----------------------------
// MAIN WORKFLOW
// -----------------------------
async function main() {
  console.log("🚀 Ramadan Reminder automation starting...");

  const today = new Date();
  const gregorianDate = formatDate(today);
  const hijriDate = getHijriDate();
  const daysLeft = daysUntilRamadan();

  // Fetch Sheet rows
  const users = await getSheetData();
  console.log(`📄 ${users.length} total entries found in sheet.`);

  // Normalize numbers
  const normalized = users.map((u) => {
    const phoneRaw = u.phone || u.phone_number || u.phoneNumber || "";
    const normalizedPhone = normalizePhone(phoneRaw);
    return {
      ...u,
      phone: normalizedPhone,
      __original_phone: phoneRaw,
    };
  });

  const invalid = normalized.filter((u) => !u.phone);
  const recipients = normalized.filter((u) => u.phone);

  if (invalid.length > 0) {
    console.log(`⚠️ ${invalid.length} invalid numbers found:`);
    invalid.forEach((r) =>
      console.log(`   - ${r.full_name || "Unknown"} → raw: "${r.__original_phone}"`)
    );
  }

  console.log(`📬 ${recipients.length} recipients will receive reminders.`);

  // DRY RUN STOP HERE
  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN ENABLED — NO WhatsApp messages sent.");
    recipients.forEach((u) =>
      console.log(` - ${u.full_name || "User"} (${u.phone})`)
    );
    console.log("\n🎉 DRY RUN complete.");
    return;
  }

  console.log("\n🔥 LIVE MODE — Real WhatsApp messages WILL be sent.");

  // SEND LOOP WITH THROTTLING & STATUS UPDATES
  for (let i = 0; i < recipients.length; i++) {
    const user = recipients[i];

    const params = [
      user.full_name,
      gregorianDate,
      hijriDate,
      `${daysLeft}`,
    ];

    console.log(`\n➡️ Sending reminder to: ${user.full_name} (${user.phone})`);

    const result = await sendWhatsAppMessage(
      user.phone,
      process.env.WABA_TEMPLATE_NAME,
      params
    );

    if (result && result.success) {
      console.log(`✅ Reminder sent to ${user.full_name}`);
      await updateDeliveryStatus(user._rowIndex, "SENT");
    } else {
      console.log(`❌ Failed for ${user.full_name}`);
      await updateDeliveryStatus(user._rowIndex, "FAILED");
    }

    // Throttle next message
    if (i < recipients.length - 1) {
      console.log("⏳ Waiting 1 second before next send...");
      await wait(1000);
    }
  }

  console.log("\n🎉 All messages processed.");
}

// -----------------------------
// EXECUTE MAIN
// -----------------------------
main().catch((err) => {
  console.error("❌ Fatal error:", err);
});
