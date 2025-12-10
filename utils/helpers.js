// utils/helpers.js
// Fully custom Hijri converter — consistent English output, no Intl issues.

const monthNames = [
  "Muharram",
  "Safar",
  "Rabi Al Awwal",
  "Rabi Al Thani",
  "Jumada Ula",
  "Jumada Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qadah",
  "Dhu al-Hijjah"
];

/**
 * Convert Gregorian → Hijri using tabular Islamic calendar
 * Returns: "DD Month YYYY"
 */
function getHijriDate(date = new Date()) {
  const gDay = date.getDate();
  const gMonth = date.getMonth();
  const gYear = date.getFullYear();

  // Julian Day
  const jd =
    Math.floor((1461 * (gYear + 4800 + Math.floor((gMonth - 14) / 12))) / 4) +
    Math.floor((367 * (gMonth + 12 * Math.floor((gMonth - 14) / 12) - 2)) / 12) -
    Math.floor((3 * Math.floor((gYear + 4900 + Math.floor((gMonth - 14) / 12)) / 100)) / 4) +
    gDay -
    32075;

  // Islamic date conversion
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const k = l - 10631 * n;
  const j = Math.floor((k - 1) / 354.36667);
  const i = k - Math.floor(j * 354.36667);

  const hijriYear = 30 * n + j + 1;
  const hijriMonth = Math.floor((i - 1) / 29.53); // approximate
  const hijriDay = Math.floor(i - hijriMonth * 29.53);

  const month = monthNames[Math.max(0, Math.min(11, hijriMonth))];

  // Output WITHOUT AH (template adds AH)
  return `${hijriDay} ${month} ${hijriYear}`;
}

/**
 * Gregorian date formatted YYYY-MM-DD
 */
function formatDate(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Days until Ramadan (using secret RAMADAN_START_ISO)
 */
function daysUntilRamadan() {
  const iso = process.env.RAMADAN_START_ISO;
  if (!iso) throw new Error("Missing RAMADAN_START_ISO");

  const t = new Date();
  const r = new Date(iso);

  const today = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  const target = Date.UTC(r.getFullYear(), r.getMonth(), r.getDate());

  return Math.max(0, Math.ceil((target - today) / 86400000));
}

module.exports = {
  formatDate,
  getHijriDate,
  daysUntilRamadan,
};
