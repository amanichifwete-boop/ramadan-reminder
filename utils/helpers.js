// utils/helpers.js
// Hijri date using Intl Islamic calendar + custom English month mapping

// -----------------------------------------------------
// Gregorian date formatter
// -----------------------------------------------------
function formatDate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// -----------------------------------------------------
// Days until Ramadan (ISO from secrets)
// -----------------------------------------------------
function daysUntilRamadan() {
  const iso = process.env.RAMADAN_START_ISO;
  if (!iso) throw new Error("Missing RAMADAN_START_ISO");

  const today = new Date();
  const r = new Date(iso);

  const tMid = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const rMid = Date.UTC(r.getFullYear(), r.getMonth(), r.getDate());

  return Math.max(0, Math.ceil((rMid - tMid) / 86400000));
}

// -----------------------------------------------------
// MAIN FIXED HIJRI DATE FUNCTION
// -----------------------------------------------------
function getHijriDate(date = new Date()) {
  let raw;

  try {
    raw = new Intl.DateTimeFormat("en-US-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(date);
  } catch (e) {
    console.error("Intl Hijri conversion error:", e);
    return "";
  }

  // Example raw outputs we must normalize:
  // "20 Jumada II 1447"
  // "20 Jumādā al-Ākhirah 1447"
  // "20 jumada ii 1447"

  const parts = raw.toLowerCase().split(" ");
  if (parts.length < 3) return raw;

  const day = parts[0];
  const year = parts[parts.length - 1];
  const monthRaw = parts.slice(1, -1).join(" ");

  // Remove diacritics for clean matching
  const clean = monthRaw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove accents
    .replace(/[^a-z\s]/g, " ")         // remove symbols
    .replace(/\s+/g, " ")
    .trim();

  // Month mapping (your style A)
  const map = {
    "muharram": "Muharram",
    "safar": "Safar",
    "rabi al awwal": "Rabi Al Awwal",
    "rabi i": "Rabi Al Awwal",
    "rabi al thani": "Rabi Al Thani",
    "rabi ii": "Rabi Al Thani",
    "jumada ula": "Jumada Ula",
    "jumada i": "Jumada Ula",
    "jumada thani": "Jumada Thani",
    "jumada ii": "Jumada Thani",
    "rajab": "Rajab",
    "shaban": "Sha'ban",
    "sha ban": "Sha'ban",
    "ramadan": "Ramadan",
    "shawwal": "Shawwal",
    "dhu al qada": "Dhu al-Qadah",
    "dhu al hijjah": "Dhu al-Hijjah"
  };

  // Find matching rule
  let month = null;
  for (const key of Object.keys(map)) {
    if (clean.includes(key)) {
      month = map[key];
      break;
    }
  }

  // Fallback: capitalize cleaned raw month
  if (!month) {
    month = clean.replace(/\b\w/g, c => c.toUpperCase());
  }

  // Final output (no double AH)
  return `${day} ${month} ${year}`;
}

module.exports = {
  formatDate,
  daysUntilRamadan,
  getHijriDate,
};
