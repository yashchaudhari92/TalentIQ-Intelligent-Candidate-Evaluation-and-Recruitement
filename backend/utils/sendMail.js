const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, subject, html, attachments = [] }) => {
  await transporter.sendMail({
    from: `"TalentIQ" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
};

module.exports = sendMail;

// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // App password (NOT normal password)
//   },
// });

// const sendMail = async (to, subject, text) => {
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to,
//     subject,
//     text,
//   });
// };

// module.exports = sendMail;