// utils/helpers.js
// Helper functions for Ramadan reminder logic using Intl for Hijri (Umm al-Qura)

'use strict';

// Convert a date to YYYY-MM-DD format (Gregorian)
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Convert today's date to Hijri (Umm al-Qura) using Intl API
function getHijriDate() {
  const today = new Date();

  // Use the "islamic-umalqura" calendar via locale extension.
  // This produces a locale-formatted Hijri date string; we'll extract day, month, year.
  const dtf = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Example output: "24 Jumada II 1447 AH" — Intl does not add "AH", so we'll append it.
  const parts = dtf.formatToParts(today);
  const day = parts.find(p => p.type === 'day')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const year = parts.find(p => p.type === 'year')?.value || '';

  return `${day} ${month} ${year} AH`;
}

// Days remaining until Ramadan 2026 (adjust the target date if needed)
function daysUntilRamadan() {
  // approximate start date (update later if you have an authoritative date)
  const ramadan2026 = new Date('2026-02-28T00:00:00Z');
  const today = new Date();
  const diffMs = ramadan2026 - today;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

module.exports = {
  formatDate,
  getHijriDate,
  daysUntilRamadan
};
