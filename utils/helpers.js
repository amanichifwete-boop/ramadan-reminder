// utils/helpers.js
// Helper functions for Ramadan reminder logic.

// Convert a date to YYYY-MM-DD format
function formatDate(date) {
  return date.toISOString().split("T")[0];
}

// Days remaining until Ramadan (placeholder target date)
function daysUntilRamadan() {
  const ramadan2025 = new Date("2025-02-28"); // adjust once official date is confirmed
  const today = new Date();

  const diffMs = ramadan2025 - today;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

module.exports = {
  formatDate,
  daysUntilRamadan
};
