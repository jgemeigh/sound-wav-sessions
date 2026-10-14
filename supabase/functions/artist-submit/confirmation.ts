export async function sendArtistConfirmation(email: string) {
  const env = (key: string) => {
    const value = Deno.env.get(key);
    if (!value) throw new Error(`Missing ${key}`);
    return value;
  };
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    body: new URLSearchParams({
      client_id: env("GMAIL_CLIENT_ID"), client_secret: env("GMAIL_CLIENT_SECRET"),
      refresh_token: env("GMAIL_REFRESH_TOKEN"), grant_type: "refresh_token",
    }),
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) throw new Error("Gmail authorization failed");
  const sender = Deno.env.get("GMAIL_SENDER_EMAIL") || "sound.wavsessions@gmail.com";
  // Fixed text avoids reflecting untrusted submission content into email headers or HTML.
  const message = [
    `From: SOUND.WAV SESSIONS <${sender}>`, `To: ${email}`,
    "Subject: We received your SOUND.WAV artist submission",
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=UTF-8", "",
    "Thanks for submitting to SOUND.WAV SESSIONS!", "",
    "We received your artist submission. We will reach out when the next show date is lined up.", "",
    "This confirms receipt of your submission, not a confirmed booking. No need to submit again.", "",
    "Thanks!", "- SOUND.WAV SESSIONS",
  ].join("\r\n");
  const raw = btoa(message).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST", signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${token.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!response.ok) throw new Error("Gmail could not send artist confirmation");
}
