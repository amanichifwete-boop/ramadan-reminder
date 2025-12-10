// app.js
// Main automation runner for Ramadan Reminder

const { getSheetData } = require("./utils/google");
const { sendWhatsAppMessage } = require("./utils/whatsapp");
const { formatDate, daysUntilRamadan, getHijriDate } = require("./utils/helpers");

// -----------------------------
// 🔥 DRY RUN CONTROL
// -----------------------------
// Set in GitHub Secrets if needed. Default = LIVE mode.
const DRY_RUN = process.env.DRY_RUN === "true" ? true : false;

/**
 * Normalize phone number to canonical form used by WABA:
 * - Remove spaces, dashes, parentheses, plus signs
 * - Convert local forms (07..., 7..., +254..., 254...) into 254XXXXXXXXX
 * - Return normalized string or null if invalid/unusable
 *
 * Accepts Kenyan mobile forms beginning with 7 or the new 1-series:
 * E.164 without plus, e.g. 2547XXXXXXXX or 2541XXXXXXXX (12 digits total)
 */
function normalizePhone(raw) {
  if (!raw && raw !== 0) return null;
  let s = String(raw).trim();

  // remove common separators
  s = s.replace(/[\s\-()]/g, "");

  // remove leading plus if present
  if (s.startsWith("+")) s = s.slice(1);

  // If starts with 0 (e.g., 0745123456) -> replace with 254
  if (/^0\d+/.test(s)) {
    s = "254" + s.slice(1);
  }

  // If starts with 7 (e.g., 745123456) -> assume missing country code, prefix 254
  if (/^7\d{8}$/.test(s)) {
    s = "254" + s;
  }

  // At this point valid forms should start with 254...
  // Accept only 254 + 9 digits (total length 12)
  // And ensure the first digit after 254 is 7 or 1 (Kenyan mobile ranges)
  const kenyaRegex = /^254(?:7|1)\d{8}$/;

  if (kenyaRegex.test(s)) return s;

  // If not matching, return null (will be treated as invalid)
  return null;
}

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

  // Normalize phones and filter only valid phone numbers (no opt-in flag required)
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
    console.log(`⚠️  ${invalid.length} rows rejected due to invalid phone format:`);
    invalid.forEach((r) =>
      console.log(`   - ${r.full_name || "<no name>"} -> raw: "${r.__original_phone}"`)
    );
  }

  console.log(`📬 ${recipients.length} recipients will receive reminders.`);

  // If DRY-RUN → stop BEFORE sending WhatsApp messages
  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN ENABLED — WhatsApp messages will NOT be sent.");
    console.log("📝 Recipients that WOULD have received messages:");
    recipients.forEach((u) => console.log(` - ${u.full_name} (${u.phone})`));
    console.log("\n🎉 DRY RUN complete.");
    return; // stop execution
  }

  // LIVE MODE — SEND REAL MESSAGES
  console.log("\n🔥 LIVE MODE — Real WhatsApp messages WILL be sent.");

  // Loop and send messages
  for (const user of recipients) {
    const params = [
      user.full_name || "", // {{1}} User Name
      gregorianDate, // {{2}} Gregorian Date
      hijriDate, // {{3}} Hijri Date
      `${daysLeft}`, // {{4}} Days Remaining
    ];

    console.log(`\n➡️ Sending reminder to: ${user.full_name || user.phone} (${user.phone})`);
    const result = await sendWhatsAppMessage(user.phone, process.env.WABA_TEMPLATE_NAME, params);

    if (result && result.success) {
      console.log(`✅ Reminder sent to ${user.full_name || user.phone}`);
    } else {
      console.log(`❌ Failed for ${user.full_name || user.phone}`);
      if (result && result.error) console.log("   error:", result.error);
    }
  }

  console.log("\n🎉 All messages processed.");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
});
