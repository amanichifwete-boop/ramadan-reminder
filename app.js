// Helper for throttling (1 message per second)
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Loop and send messages with throttling + delivery status
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

  // SEND message (with internal retries already handled)
  const result = await sendWhatsAppMessage(
    user.phone,
    process.env.WABA_TEMPLATE_NAME,
    params
  );

  // Update delivery status
  if (result && result.success) {
    console.log(`✅ Reminder sent to ${user.full_name}`);
    await updateDeliveryStatus(user._rowIndex, "SENT");
  } else {
    console.log(`❌ Failed for ${user.full_name}`);
    await updateDeliveryStatus(user._rowIndex, "FAILED");
  }

  // THROTTLING — wait 1 second before sending the next message
  if (i < recipients.length - 1) {
    console.log("⏳ Waiting 1 second before next send...");
    await wait(1000);
  }
}
