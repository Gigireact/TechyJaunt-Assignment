
const ejs = require("ejs");
const path = require("path");

const templatesDir = path.join(__dirname, "../templates");

const sendEmail = async ({ to, subject, template, data, text }) => {
  const html = await ejs.renderFile(
    path.join(templatesDir, `${template}.ejs`),
    data
  );

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    console.error("Resend email error:", result);
    throw new Error(result.message || "Email delivery failed");
  }

  return result;
};

module.exports = sendEmail;
