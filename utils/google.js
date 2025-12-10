// utils/google.js
// Google Sheets integration using Base64-encoded Service Account JSON

const { google } = require("googleapis");

/**
 * Decode Base64 service account JSON safely
 */
function getAuthClient() {
  try {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
      throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
    }

    // Decode Base64 → UTF-8 JSON
    const jsonString = Buffer.from(
      process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64,
      "base64"
    ).toString("utf8");

    // Parse into JSON object
    const credentials = JSON.parse(jsonString);

    // Create Google Auth client
    return new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );
  } catch (err) {
    console.error("❌ ERROR decoding service account JSON:", err.message);
    throw err;
  }
}

/**
 * Fetch data from Google Sheet
 */
async function getSheetData() {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Sheet1!A2:F"; // Reads A–F (full_name → opt_in_status)

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });

    const rows = response.data.values || [];

    // Convert array → object with safe fallbacks
    return rows.map((row) => ({
      full_name: row[0] || "",
      gender: row[1] || "",
      location: row[2] || "",
      phone: row[3] || "",
      category: row[4] || "",
      opt_in_status: row[5] || "",
    }));
  } catch (err) {
    console.error("❌ ERROR fetching sheet data:", err.message);
    throw err;
  }
}

module.exports = { getSheetData };
