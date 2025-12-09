// utils/helpers.js
// Hijri date conversion using native Intl (no external packages)

'use strict';

// Convert to YYYY-MM-DD (Gregorian)
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Convert today's date to Hijri using Intl Islamic calendar
function getHijriDate() {
  const today = new Date();

  const formatted = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(today);

  const clean = formatted.replace(",", "").trim();
  const tokens = clean.split(/\s+/);

  const day = tokens.find(t => /^\d+$/.test(t)) || "";
  const year = [...tokens].reverse().find(t => /^\d+$/.test(t)) || "";

  const monthTokens = tokens.filter(t => t !== day && t !== year);
  const monthName = monthTokens.join(" ").trim() || "Jumada al-Thani";

  return `${day} ${monthName} ${year} AH`;
}

// Countdown to Ramadan 2026
function daysUntilRamadan() {
  const ramadan2026 = new Date("2026-02-28T00:00:00Z");
  const today = new Date();
  const diff = ramadan2026 - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

module.exports = {
  formatDate,
  getHijriDate,
  daysUntilRamadan
};

