const sendEmail = require("../utils/sendEmail");

async function handlePayment(req, res) {
  try {
    console.log("[CONTROLLER][HANDLE-PAYMENT] start");
    const { email, name, phone } =
      req?.body?.data?.object?.charges?.data[0]?.billing_details;
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    const html = `
    <div style="width: 100%; text-align: center;">
        <div>
            Ecco il codice del tuo biglietto: <strong>${result.toUpperCase()}</strong>
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
