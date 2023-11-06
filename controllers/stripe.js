const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const sendEmail = require("../utils/sendEmail");
const airtable = require("../utils/airtable");

async function handlePayment(req, res) {
  try {
    console.log(req.body);
    console.log(req.body.data.object);
    console.log("[CONTROLLER][HANDLE-PAYMENT] start");
    const { email, name, phone } =
      req?.body?.data?.object?.charges?.data[0]?.billing_details;
    const { receipt_url } = req?.body?.data?.object?.charges?.data[0];
    const amount = req?.body?.data?.object?.amount;
    const session = await stripe.checkout.sessions.retrieve(
      req?.body?.data?.object?.id,
      {
        expand: ["line_items"],
      }
    );
    console.log("session :", session);
    console.log(session.line_items.data[0]);
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
      Ticket: ticket.toUpperCase(),
      Phone: phone,
      Timestamp: formattedDate,
      Amount: (amount / 100).toFixed(2),
      Receipt: receipt_url,
      Stripe_Event_ID: req?.body?.id,
    });
    const html = `
    <div style="width: 100%; text-align: center;">
    <img src="https://ceramichine-810ca30742b9.herokuapp.com/asset/logo" width="200" />
    <br /><h2>Ticket:</h2> <h1>${ticket.toUpperCase()}</h1>
    <h4>Ti aspettiamo all'evento! Conserve questa mail ed il codice del ticket.</h4>
    <a href="${receipt_url}" download="Ricevuta di Pagamento">Ricevuta di pagamento</a>
    <br />
    <div><i>Non rispondere a questa mail, se hai bisogno di aiuto invia un email ad info@ceramichine.com</i></div>
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
