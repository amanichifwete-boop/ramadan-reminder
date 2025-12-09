// utils/helpers.js
// Use Intl Islamic calendar for Hijri conversion (proven working)

'use strict';

// Gregorian YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Hijri conversion using Intl (same method used in your working project)
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

// Ramadan countdown
function daysUntilRamadan() {
  const ramadan2026 = new Date("2026-02-28T00:00:00Z");
  const today = new Date();
  const diffMs = ramadan2026 - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

module.exports = {
  formatDate,
  getHijriDate,
  daysUntilRamadan
};
