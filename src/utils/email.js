import nodemailer from 'nodemailer';
import imap from 'imap-simple';
import { simpleParser } from 'mailparser';
import { config } from '../config.js';

// 1. Sender
export async function sendEmail(subject, htmlContent) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: config.email.user, pass: config.email.pass },
  });

  await transporter.sendMail({
    from: `"AI News Bot" <${config.email.user}>`,
    to: config.email.recipient,
    subject: subject,
    html: htmlContent,
  });
  console.log(`📧 Sent: ${subject}`);
}

// 2. Receiver (IMAP)
export async function checkInboxForReply(subjectKeyword) {
  const imapConfig = {
    imap: {
      user: config.email.user,
      password: config.email.pass,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 10000,
    },
  };

  try {
    const connection = await imap.connect(imapConfig);
    await connection.openBox('INBOX');

    // Search for UNSEEN emails with the specific subject
    const searchCriteria = ['UNSEEN', ['HEADER', 'SUBJECT', subjectKeyword]];
    const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };
    
    const messages = await connection.search(searchCriteria, fetchOptions);

    if (messages.length === 0) {
      connection.end();
      return null;
    }

    // Process the latest message
    const item = messages[messages.length - 1];
    const all = item.parts.find((part) => part.which === 'TEXT');
    const id = item.attributes.uid;
    const idHeader = 'Imap-Id: ' + id + '\r\n';
    
    const parsed = await simpleParser(idHeader + all.body);
    
    connection.end();
    return parsed.text; // Return the plain text body of the reply
  } catch (err) {
    console.error("IMAP Error:", err);
    return null;
  }
}