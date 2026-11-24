
const { google } = require("googleapis");
const ejs = require("ejs");
const path = require("path");
const crypto = require("crypto");

const templatesDir = path.join(__dirname, "../templates");

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({
  version: "v1",
  auth: oauth2Client,
});

const encodeBase64 = (value) => {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .match(/.{1,76}/g)
    .join("\r\n");
};

const sendEmail = async ({ to, subject, template, data, text }) => {
  try {
    const html = await ejs.renderFile(
      path.join(templatesDir, `${template}.ejs`),
      data
    );

    const boundary = `boundary_${crypto.randomBytes(12).toString("hex")}`;

    const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`;

    const message = [
      `From: KoboMarket <${process.env.GMAIL_USER}>`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      "MIME-Version: 1.0",
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      "",
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      encodeBase64(text || ""),
      "",
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      encodeBase64(html),
      "",
      `--${boundary}--`,
    ].join("\r\n");

    const raw = Buffer.from(message).toString("base64url");

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return response.data;
  } catch (error) {
    console.error("Gmail email error:", error.message);
    throw new Error("Email delivery failed");
  }
};

module.exports = sendEmail;
