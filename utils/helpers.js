// utils/helpers.js
// Unified Gregorian + Hijri date helpers

const moment = require("moment-hijri");

// -----------------------------
// Format Gregorian date
// -----------------------------
function formatDate(date) {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// -----------------------------
// Hijri Date (fixed, correct, readable)
// -----------------------------
function getHijriDate() {
  try {
    // Use moment-hijri automatic conversion
    const hijri = moment().format("iD iMMMM iYYYY");

    // Example output:
    // "19 Jumada Al Akhira 1447"
    return hijri + " AH";
  } catch (e) {
    console.error("Hijri conversion error:", e);
    return "Hijri date unavailable";
  }
}

// -----------------------------
// Calculate days until next Ramadan
// -----------------------------
function daysUntilRamadan() {
  // Ramadan start ISO date from GitHub Secrets
  const ramadanIso = process.env.RAMADAN_START_ISO;

  if (!ramadanIso) {
    throw new Error("Missing RAMADAN_START_ISO in GitHub secrets");
  }

  const today = new Date();
  const ramadanDate = new Date(ramadanIso);

  const diffMs = ramadanDate - today;
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

// -----------------------------
// EXPORT all helpers properly
// -----------------------------
module.exports = {
  formatDate,
  getHijriDate,
  daysUntilRamadan,
};
