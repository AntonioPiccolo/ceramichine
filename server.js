const express = require("express");
const stripe = require("./controllers/stripe");
const app = express();
const PORT = process.env.PORT || 3000;
require("dotenv").config();

const logRequestStart = (req, res, next) => {
  console.info(`${req.method} ${req.originalUrl} ${JSON.stringify(req.body)}`);
  next();
};

app.use(express.json());
app.use(logRequestStart);

app.post("/api/payment", stripe.handlePayment);

app.get("/asset/logo", function (req, res) {
  res.sendFile("/assets/logo.png", { root: __dirname });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
