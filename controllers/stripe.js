const sendEmail = require("../utils/sendEmail");
const airtable = require("../utils/airtable");

async function handlePayment(req, res) {
  try {
    console.log("[CONTROLLER][HANDLE-PAYMENT] start");
    const { email, name, phone } =
      req?.body?.data?.object?.charges?.data[0]?.billing_details;
    let ticket = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      ticket += characters.charAt(randomIndex);
    }
    const date = new Date(); // Replace with your date
    const formattedDate = date.toISOString().split("T")[0];
    await airtable.create("payments", {
      Email: email,
      Name: name,
      Ticket: ticket,
      Phone: phone,
      Timestamp: formattedDate,
    });
    const html = `
    <div style="width: 100%; text-align: center;">
        <div>
            Ecco il codice del tuo biglietto: <strong>${ticket.toUpperCase()}</strong>
        </div>
    </div>`;
    await sendEmail(email, "Ticket Ceramichine", html);
    console.log("[CONTROLLER][HANDLE-PAYMENT] end");
    res.send({ message: "ok" });
  } catch (err) {
    console.error("[CONTROLLER][HANDLE-PAYMENT] error", err);
    res.status(500).send({ message: "error" });
  }
}

module.exports = {
  handlePayment,
};
