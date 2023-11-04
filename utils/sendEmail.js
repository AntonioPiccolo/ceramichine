const nodemailer = require("nodemailer");
const emailTransport = {
  host: "smtps.aruba.it",
  // logger: true,
  // debug: true,
  secure: true,
  port: 465,
  auth: {
    user: "noreply@liftland.it",
    pass: "!a2881AE42E1442561CD38344F1EB6DFF7",
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

module.exports = async function sendEmail(to, subject, html) {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport(emailTransport);
    await transporter.sendMail({
      from: "Ceramichine <noreply@liftland.it>",
      to,
      subject,
      html,
    });
  } catch (err) {
    throw err;
  }
};
