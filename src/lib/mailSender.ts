import nodemailer from "nodemailer";

export async function sendMail(email: string, subject: string, html: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST!,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASSWORD!,
    },
  });

  return transporter.sendMail({
    from: `"Alpha Art & Events" <${process.env.MAIL_USER}>`,
    to: email,
    subject,
    html,
  });
}
