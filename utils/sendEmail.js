const nodemailer = require("nodemailer");

module.exports = async function sendEmail(to, subject, html) {
  const emailTransport = {
    host: "smtps.aruba.it",
    // logger: true,
    // debug: true,
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PW,
    },
    tls: {
      rejectUnauthorized: false,
    },
    /*
    tls:{
      minVersion: 'TLSv1',
      ciphers:'HIGH:MEDIUM:!aNULL:!eNULL:@STRENGTH:!DH:!kEDH'
    }
    */
  };
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport(emailTransport);
    await transporter.sendMail({
      from: "Ceramichine <noreply@liftland.it>",
      to,
      subject,
      html,
    });
    console.info("[UTILS][SEND-EMAIL] success");
  } catch (err) {
    throw err;
  }
};
