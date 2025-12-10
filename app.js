// Loop and send messages
for (let i = 0; i < recipients.length; i++) {
  const user = recipients[i];

  // WhatsApp template parameters
  const params = [
    user.full_name,
    gregorianDate,
    hijriDate,
    `${daysLeft}`
  ];

  console.log(`\n➡️ Sending reminder to: ${user.full_name} (${user.phone})`);

  const result = await sendWhatsAppMessage(
    user.phone,
    process.env.WABA_TEMPLATE_NAME,
    params
  );

  if (result && result.success) {
    console.log(`✅ Reminder sent to ${user.full_name}`);
    await updateDeliveryStatus(user._rowIndex, "SENT");
  } else {
    console.log(`❌ Failed for ${user.full_name}`);
    await updateDeliveryStatus(user._rowIndex, "FAILED");
  }
}
