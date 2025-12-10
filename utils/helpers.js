// utils/helpers.js
// Gregorian formatting, Hijri (English transliteration), and Ramadan countdown

/**
 * formatDate - returns date in YYYY-MM-DD (ISO)
 */
function formatDate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * daysUntilRamadan - uses RAMADAN_START_ISO secret
 */
function daysUntilRamadan() {
  const iso = process.env.RAMADAN_START_ISO;
  if (!iso) throw new Error("Missing RAMADAN_START_ISO in GitHub secrets");

  const today = new Date();
  const r = new Date(iso);

  const todayMid = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const rMid     = Date.UTC(r.getFullYear(), r.getMonth(), r.getDate());

  return Math.max(0, Math.ceil((rMid - todayMid) / 86400000));
}

/**
 * getHijriDate - produces clean English Hijri date:
 * e.g., "20 Jumada Thani 1447 AH"
 *
 * Uses Intl Islamic calendar → normalizes month names.
 */
function getHijriDate(d = new Date()) {
  let formatted;

  try {
    const opts = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
    formatted = new Intl.DateTimeFormat("en-US-u-ca-islamic", opts).format(d);
    // Example raw outputs:
    // "20 Jumada II 1447"
    // "20 Jumādā al-Ākhirah 1447"
  } catch (e) {
    console.error("Hijri date conversion error:", e);
    return "";
  }

  const parts = formatted.trim().split(/\s+/);
  if (parts.length < 3) return formatted + " AH";

  const day = parts[0];
  const year = parts[parts.length - 1];

  // Month tokens (may contain diacritics, Roman numerals, etc.)
  const monthTokens = parts.slice(1, parts.length - 1).join(" ").toLowerCase();

  /**
   * ❤️ Your preferred transliteration style (A):
   * Jumada Ula  (for Jumada I)
   * Jumada Thani (for Jumada II)
   */
  const monthMap = [
    { keys: ["muharram"], val: "Muharram" },
    { keys: ["safar"], val: "Safar" },
    { keys: ["rabi i", "rabi al-awwal", "rabial awwal"], val: "Rabi Al Awwal" },
    { keys: ["rabi ii", "rabi al-thani"], val: "Rabi Al Thani" },
    { keys: ["jumada i", "jumada al-ula", "jumada ula"], val: "Jumada Ula" },
    { keys: ["jumada ii", "jumada al-akhirah", "jumada thani"], val: "Jumada Thani" },
    { keys: ["rajab"], val: "Rajab" },
    { keys: ["shaban", "sha'ban", "shaaban"], val: "Sha'ban" },
    { keys: ["ramadan"], val: "Ramadan" },
    { keys: ["shawwal"], val: "Shawwal" },
    { keys: ["dhu al-qadah", "dhul-qadah", "dhul qada"], val: "Dhu al-Qadah" },
    { keys: ["dhu al-hijjah", "dhul-hijjah", "dhul hijjah"], val: "Dhu al-Hijjah" }
  ];

  // Normalize diacritics → simple a/u/i
  const cleaned = monthTokens
    .replace(/ā/g, "a")
    .replace(/ū/g, "u")
    .replace(/ī/g, "i")
    .replace(/\./g, "")
    .replace(/[^\w\s]/g, " ")
    .trim();

  let cleanedMonth = cleaned;

  // Match month
  let found = monthMap.find(m =>
    m.keys.some(k => cleaned.includes(k) || cleanedMonth.includes(k))
  );

  const monthFinal = found ? found.val : cleanedMonth;

  // Desired format:
  //  "20 Jumada Thani 1447 AH"
  return `${day} ${monthFinal} ${year} AH`;
}

module.exports = {
  formatDate,
  daysUntilRamadan,
  getHijriDate,
};
