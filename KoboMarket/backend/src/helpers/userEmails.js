const sendEmail = require("./email");

const sendOtpEmail = (user, otp, { subject, heading, purpose }) =>
  sendEmail({
    to: user.email,
    subject,
    template: "otp",
    text: `Hi ${user.firstName}, your code is ${otp}. Use it to ${purpose}. It expires in 10 minutes.`,
    data: {
      firstName: user.firstName,
      otp,
      heading,
      purpose,
      expiresInMinutes: 10,
      year: new Date().getFullYear(),
    },
  });

const sendLoginAlertEmail = (user, loginTime) =>
  sendEmail({
    to: user.email,
    subject: "Login Notification",
    template: "login-notification",
    text: `Hi ${user.firstName}, someone just signed in to your account (${user.email}) at ${loginTime}. If this was not you, reset your password.`,
    data: {
      firstName: user.firstName,
      email: user.email,
      date: loginTime,
      year: new Date().getFullYear(),
    },
  });

module.exports = { sendOtpEmail, sendLoginAlertEmail };
