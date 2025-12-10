// utils/helpers.js
// Date helpers: Gregorian formatting, Hijri conversion (English month names), countdown

/**
 * formatDate - returns ISO date string YYYY-MM-DD
 */
function formatDate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * daysUntilRamadan - uses RAMADAN_START_ISO env (YYYY-MM-DD) to compute days left
 */
function daysUntilRamadan() {
  const startIso = process.env.RAMADAN_START_ISO;
  if (!startIso) {
    throw new Error("Missing RAMADAN_START_ISO in GitHub secrets");
  }
  const today = new Date();
  // normalize local midnight for comparison
  const todayUtcMid = Date.UTC(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const target = new Date(startIso);
  const targetUtcMid = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate()
  );
  const diffMs = targetUtcMid - todayUtcMid;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * getHijriDate - returns a human friendly English Hijri date string
 * e.g. "19 Jumada Al Akhira 1447AH"
 *
 * Uses Intl with 'islamic' calendar then normalizes the month to
 * desired English transliteration.
 */
function getHijriDate(d = new Date()) {
  // Use Intl.DateTimeFormat with islamic calendar
  // Some environments may not support the 'u-ca-islamic' extension;
  // most modern Node runtimes do. This produces month names we normalize below.
  const opts = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
  let formatted;
  try {
    formatted = new Intl.DateTimeFormat("en-US-u-ca-islamic", opts).format(d);
    // formatted examples: "19 Jumādā al-Ākhirah 1447" or "19 Jumada II 1447"
  } catch (e) {
    // Fallback: approximate by returning empty friendly string (so caller still sees something)
    return "";
  }

  // Split into day, monthPart, year
  // formatted may be like: "19 Jumādā al-Ākhirah 1447" or "19 Jumada II 1447"
  const parts = formatted.trim().split(/\s+/);
  if (parts.length < 3) {
    return formatted + " AH";
  }

  const day = parts[0];
  const year = parts[parts.length - 1];

  // month tokens are everything between day and year
  const monthTokens = parts.slice(1, parts.length - 1).join(" ");

  // Normalise monthTokens to simplified lowercase to map reliably
  const mt = monthTokens.toLowerCase();

  // map various Intl month renderings to our preferred English transliterations
  const monthMap = [
    { keys: ["muharram"], val: "Muharram" },
    { keys: ["safar"], val: "Safar" },
    { keys: ["rabi al-awwal", "rabi' al-awwal", "rabi' i al-awwal", "rabi' al awal", "rabi al-awwal", "rabi al awwal", "rabi al-awwal".toLowerCase()], val: "Rabi Al Awwal" },
    { keys: ["rabi al-thani", "rabi' al-thani", "rabi al-thani", "rabi al thani"], val: "Rabi Al Thani" },
    { keys: ["jumada al-ula", "jumada al-ula", "jumada al-ula".toLowerCase(), "jumada i", "jumada i".toLowerCase(), "jumada i".toLowerCase()], val: "Jumada Al Ula" },
    { keys: ["jumada al-akhirah", "jumada al-akhira", "jumada al-akhira", "jumada ii", "jumada al akhirah"], val: "Jumada Al Akhira" },
    { keys: ["rajab"], val: "Rajab" },
    { keys: ["sha'ban", "shaban", "sha‘ban"], val: "Sha'ban" },
    { keys: ["ramadan", "ramadhan"], val: "Ramadan" },
    { keys: ["shawwal"], val: "Shawwal" },
    { keys: ["dhul qa'dah", "dhul-qadah", "dhu al-qa'dah", "dhu al-qadah", "dhu al qa'dah"], val: "Dhu al-Qadah" },
    { keys: ["dhul hijjah", "dhu al-hijjah", "dhu al hijjah", "dhul-hijjah"], val: "Dhu al-Hijjah" }
  ];

  // best-effort match
  let month = monthMap.find((m) =>
    m.keys.some((k) => mt.includes(k))
  );

  // fallback strategy: try remove diacritics and match simple tokens
  if (!month) {
    // simple token replacements
    const simple = mt
      .replace(/ā/g, "a")
      .replace(/ū/g, "u")
      .replace(/ī/g, "i")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    month = monthMap.find((m) =>
      m.keys.some((k) => simple.includes(k.replace(/[^a-z]/g, "")))
    );
  }

  const monthStr = month ? month.val : monthTokens;

  // final assembly, append AH suffix
  return `${day} ${monthStr} ${year}AH`;
}

module.exports = { formatDate, daysUntilRamadan, getHijriDate };
