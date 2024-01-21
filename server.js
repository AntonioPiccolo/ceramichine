const express = require("express");
const stripe = require("./controllers/stripe");
const PORT = process.env.PORT || 3000;
const { authWebhookStripePaymenet } = require("./middlewares/auth");
const bodyParser = require("body-parser");
require("dotenv").config();

const logRequestStart = (req, res, next) => {
  console.info(`${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);
  next();
};

const app = express();
if (process.env.NODE_ENV === "production") {
  app.use(bodyParser.raw({ type: "application/json" }));
}
app.use(express.json());
app.use(logRequestStart);

app.post("/api/payment", authWebhookStripePaymenet, stripe.handlePayment);

app.get("/asset/logo", function (req, res) {
  res.sendFile("/assets/logo.png", { root: __dirname });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
