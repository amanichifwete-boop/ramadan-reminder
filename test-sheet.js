import { google } from "googleapis";
import "dotenv/config";

async function testSheet() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID,
      range: process.env.SHEET_RANGE,
    });

    console.log("SUCCESS — Sheet connected!");
    console.log("First 3 rows:", res.data.values.slice(0, 3));
  } catch (err) {
    console.error("❌ ERROR — Sheet connection failed:", err.message);
  }
}

testSheet();
