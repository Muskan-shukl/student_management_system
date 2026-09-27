const env = require('../config/env');

/**
 * Outbound email. No provider is wired yet, so in development the message is
 * printed to the console. To send real mail, replace `deliver` with a call to
 * your provider (Resend, SendGrid, Nodemailer/SMTP…) — nothing else changes.
 */
const deliver = async ({ to, subject, text }) => {
  if (env.isProduction) {
    console.warn(`[mailer] No email provider configured — could not send "${subject}" to ${to}`);
    return;
  }
  console.log(`\n[mailer] To: ${to}\n[mailer] Subject: ${subject}\n${text}\n`);
};

const sendPasswordReset = ({ to, name, link, expiresInMinutes }) =>
  deliver({
    to,
    subject: 'Reset your Vidyara password',
    text: `Hi ${name},\n\nUse the link below to choose a new password. It expires in ${expiresInMinutes} minutes.\n\n${link}\n\nIf you didn't request this, you can ignore this email.`,
  });

module.exports = { sendPasswordReset };
