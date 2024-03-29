const express = require("express");
const stripe = require("./controllers/stripe");
const ticket = require("./controllers/ticket");
const html = require("./controllers/html");
const PORT = process.env.PORT || 3000;
const { authWebhookStripePaymenet } = require("./middlewares/auth");
const bodyParser = require("body-parser");
require("dotenv").config();

const logRequestStart = (req, res, next) => {
  console.info(`${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);
  next();
};

const app = express();

app.use(express.json());
app.use(logRequestStart);

app.post("/api/payment", function (req, res, next) {
  if (process.env.NODE_ENV === "production") {
    bodyParser.raw({ type: "application/json" })
  }
  next()
}, authWebhookStripePaymenet, stripe.handlePayment);
app.post("/api/ticket", ticket.verify);
app.post("/api/giftcard", ticket.bookEventGiftcard);

app.get("/html/form", html.form);
app.get("/html/giftcard", html.giftcard);

app.get("/asset/logo", function (req, res) {
  res.sendFile("/assets/logo.png", { root: __dirname });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
