const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

async function authWebhookStripePaymenet(req, res, next) {
  if (process.env.NODE_ENV === "production") {
    const sig = req.headers["stripe-signature"];
    let auth;
    try {
      auth = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_PAYMENT_WEBHOOK_KEY
      );
      req.body = auth;
    } catch (err) {
      console.warn("[MIDDLEWARE][STRIPE-WEBHOOK-AUTH-PAYMENT] Not Authorized");
      return res.status(400).send(`Not Authorized`);
    }
  }
  next();
}

module.exports = { authWebhookStripePaymenet };
