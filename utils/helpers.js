// utils/helpers.js
// Helper functions for Ramadan reminder logic.

const Hijri = require("hijri-converter");

// Convert a date to YYYY-MM-DD format (Gregorian)
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Convert today's date to Hijri (Umm al-Qura)
function getHijriDate() {
  const today = new Date();
  const h = Hijri.toHijri(today);

  // Example output: "24 Jumada II 1447 AH"
  const hijriMonthNames = [
    "Muharram", "Safar", "Rabi' I", "Rabi' II", "Jumada I", "Jumada II",
    "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qadah", "Dhu al-Hijjah"
  ];

  const monthName = hijriMonthNames[h.hm - 1];

  return `${h.hd} ${monthName} ${h.hy} AH`;
}

// Days remaining until Ramadan 2026 (adjust if needed)
function daysUntilRamadan() {
  const ramadan2026 = new Date("2026-02-28"); // Approximate start date
  const today = new Date();
  const diffMs = ramadan2026 - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

module.exports = {
  formatDate,
  getHijriDate,
  daysUntilRamadan
};
