const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendBudgetAlertEmail({ category, spent, limit, to }) {
  const recipient = to || process.env.ALERT_TO || process.env.SMTP_USER;
  const pct = limit > 0 ? Math.round((spent / limit) * 100) : 100;

  return transporter.sendMail({
    from: process.env.ALERT_FROM || process.env.SMTP_USER,
    to: recipient,
    subject: `Budget Alert: ${pct}% of ${category} budget used`,
    text: `Category: ${category}\nSpent: ${spent}\nBudget Limit: ${limit}\nUsage: ${pct}%`,
  });
}

module.exports = { sendBudgetAlertEmail };
