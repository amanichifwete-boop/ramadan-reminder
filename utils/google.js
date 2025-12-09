// utils/google.js
// Real Google Sheets integration using Service Account credentials

const { google } = require("googleapis");

/**
 * Decode Base64 service account JSON
 */
function getAuthClient() {
  const jsonString = Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    "base64"
  ).toString("utf8");

  const credentials = JSON.parse(jsonString);

  return new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  );
}

/**
 * Fetch data from Google Sheet
 */
async function getSheetData() {
  const auth = getAuthClient();
  const sheets = google.sheets({ version: "v4", auth });

  const sheetId = process.env.GOOGLE_SHEET_ID;
  const range = "Sheet1!A2:F"; // Reads only user columns (A–F)

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const rows = response.data.values || [];

  // Transform rows into objects
  return rows.map((row) => ({
    full_name: row[0] || "",
    gender: row[1] || "",
    location: row[2] || "",
    phone: row[3] || "",
    category: row[4] || "",
    opt_in_status: row[5] || "",
  }));
}

module.exports = { getSheetData };
