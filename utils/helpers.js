// utils/helpers.js
// date helpers for Ramadan Reminder

/**
 * formatDate - returns YYYY-MM-DD (Gregorian) for logs/messages
 */
function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * getHijriDate - returns nicely formatted Hijri date string like:
 * "19 Jumada Al Akhira 1447AH"
 *
 * Uses Intl.DateTimeFormat with 'islamic' calendar and applies a timezone offset
 * (default +3 hours) to avoid UTC day-shift errors when running in CI.
 *
 * To override timezone offset set env var: HJ_TZ_OFFSET_HOURS (can be negative)
 */
function getHijriDate() {
  // timezone offset in hours to apply before converting to Hijri (default EAT +3)
  const offsetHours = Number(process.env.HJ_TZ_OFFSET_HOURS ?? 3);

  // current time adjusted by offset
  const now = new Date(Date.now() + offsetHours * 60 * 60 * 1000);

  // Use Intl to format using the islamic calendar
  // We'll request parts and build the string so we can control capitalization and ordering.
  const fmt = new Intl.DateTimeFormat("en-GB-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC", // we already applied offset above
  });

  // Using formatToParts so we can re-order and normalize strings
  const parts = fmt.formatToParts(now).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});

  let day = parts.day || "";
  let month = parts.month || "";
  let year = parts.year || "";

  // Normalise some common month name variations to the desired style
  // e.g. "jumada al-akhirah" -> "Jumada Al Akhira"
  const normalizations = {
    "jumada al-akhirah": "Jumada Al Akhira",
    "jumada al-thani": "Jumada Al Akhira", // fallback if variant used
    "jumada al-ula": "Jumada Al Ula",
    "jumada al-awwal": "Jumada Al Ula",
    "ramadan": "Ramadan",
    "shawwal": "Shawwal",
    "dhul al-hijjah": "Dhul al-Hijjah",
    "dhul hijjah": "Dhul al-Hijjah",
    "dhul qadah": "Dhul al-Qadah",
    "rabi' al-awwal": "Rabi Al Awwal",
    "rabi' al-thani": "Rabi Al Thani",
    "rabi al-thani": "Rabi Al Thani",
    "safar": "Safar",
    "muharram": "Muharram",
    "rajab": "Rajab",
    "sha’ban": "Sha'ban",
    "sha'ban": "Sha'ban",
  };

  const monthLower = month.toLowerCase();
  if (normalizations[monthLower]) {
    month = normalizations[monthLower];
  } else {
    // Title-case the month words
    month = month
      .split(/[\s\-']/)
      .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  }

  // Append AH to year
  const hijri = `${day} ${month} ${year}AH`;
  return hijri;
}

/**
 * daysUntilRamadan - returns integer days until a target Ramadan start date.
 * Update targetRamadanISO to the expected Gregorian start date for Ramadan 2026.
 */
function daysUntilRamadan() {
  // set your expected Ramadan start date (Gregorian) for countdown
  // e.g. if Ramadan 2026 is estimated to start on 2026-02-24
  const targetRamadanISO = process.env.RAMADAN_START_ISO || "2026-02-24";
  const today = new Date(Date.now() + (Number(process.env.HJ_TZ_OFFSET_HOURS ?? 3) * 3600 * 1000));
  const target = new Date(targetRamadanISO + "T00:00:00Z");
  const diffMs = target - today;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

module.exports = { formatDate, getHijriDate, daysUntilRamadan };
