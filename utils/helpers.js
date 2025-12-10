function getHijriDate() {
  // Use today first
  const today = new Date();

  // Apply correction offset (Kenya usually -1 day from Umm al-Qura)
  const corrected = new Date(today);
  corrected.setDate(corrected.getDate() - 1);

  // Format Hijri date using Intl API
  const hijri = new Intl.DateTimeFormat('en-TZ-u-ca-islamic', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(corrected);

  // Output clean format like "19 Jumada Al Akhira 1447 AH"
  return hijri.replace(" AH", "").trim() + " AH";
}
