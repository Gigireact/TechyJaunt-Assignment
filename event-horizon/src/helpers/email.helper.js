const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
const sendVerificationEmail = async (to, token) => {
    const verificationLink = `http://localhost:${process.env.PORT || 3000}/api/auth/verify-email?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: 'Verify your email',
        html: `<a href="${verificationLink}">Verify Email</a>`
    };
    await transporter.sendMail(mailOptions);
};
module.exports = { sendVerificationEmail };