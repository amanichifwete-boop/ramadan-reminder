// utils/google.js
// Real Google Sheets integration using Service Account credentials

const { google } = require("googleapis");

/**
 * Decode Base64 service account JSON
 */
function getAuthClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
  }

  const jsonString = Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64,
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
  const range = "Sheet1!A2:H"; // includes all columns

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  });

  const rows = response.data.values || [];

  // Map each row to an object matching your sheet structure
  return rows.map((row) => ({
    timestamp: row[0] || "",
    full_name: row[1] || "",
    gender: row[2] || "",
    location: row[3] || "",
    phone: row[4] || "",
    category: row[5] || "",
    opt_in_status: row[6] || "",
    delivery_status: row[7] || "",
  }));
}

module.exports = { getSheetData };
