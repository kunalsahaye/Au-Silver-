import "server-only";

/** Sends an alert via Resend if RESEND_API_KEY is set; otherwise just logs. */
export async function notify(subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;
  if (!key || !to) { console.log("[alert]", subject); return; }
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ALERT_EMAIL_FROM || "Store Alerts <onboarding@resend.dev>",
        to: [to], subject, html,
      }),
    });
  } catch (e) { console.error("alert failed", e); }
}
