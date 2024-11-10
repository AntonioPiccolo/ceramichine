const express = require("express");
require("dotenv").config();
const cors = require('cors');
const stripe = require("./controllers/stripe");
const ticket = require("./controllers/ticket");
const application = require("./controllers/app");
const html = require("./controllers/html");
const PORT = process.env.PORT || 3000;
const { authWebhookStripePaymenet } = require("./middlewares/auth");
const bodyParser = require("body-parser");
const path = require('path'); // Modulo per gestire i percorsi

const logRequestStart = (req, res, next) => {
  console.info(`${req.headers}`);
  console.info(`${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);
  next();
};

function customBodyParser(req, res, next) {
  console.log(req.url, process.env.NODE_ENV);
  if (req.url === "/api/payment" && process.env.NODE_ENV === "production") {
    bodyParser.raw({ type: "application/json" })(req, res, next);
  } else {
    next();
  }
}

const app = express();
app.use(cors());
app.use(customBodyParser);
app.use(express.json());
app.use(logRequestStart);

app.post("/api/payment", authWebhookStripePaymenet, stripe.handlePayment);
app.post("/api/ticket", ticket.verify);
app.post("/api/giftcard", ticket.bookEventGiftcard);
app.post("/api/generateEvent", stripe.generateEvent);

app.get("/api/app/get-events", application.getEvents);
app.get("/api/app/future-events", application.getFutureEvents);

app.get("/html/form", html.form);
app.get("/html/giftcard", html.giftcard);
app.get("/html/generateEvent", html.generateEvent);

app.get("/asset/logo", function (req, res) {
  res.sendFile("/assets/logo.png", { root: __dirname });
});

app.use(express.static(path.join(__dirname, 'build')));

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
