import nodeMailer from "nodemailer";

export const sendEmail = async (
  destinationEmail: string,
  emailHtml: string,
  subject: string
) => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  console.log(user);
  const transport = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });

  await transport.sendMail({
    from: `Cars <${user}>`,
    to: destinationEmail,
    subject,
    html: emailHtml,
  });
};
