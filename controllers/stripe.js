const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const sendEmail = require("../utils/sendEmail");
const hubspot = require("../utils/hubspot");
const { invertDate, isValidDateTimeFormat } = require("../utils/utils");
const validator = require("validator");

const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function getExpirationDate(date) {
  if (date.includes("days")) {
    const now = new Date();
    const expDate = now.setDate(now.getDate() + parseInt(date.split(" ")[0]));
    return new Date(expDate).toISOString().split("T")[0];
  } else if (date.includes("months")) {
    const now = new Date();
    const expDate = now.setMonth(now.getMonth() + parseInt(date.split(" ")[0]));
    return new Date(expDate).toISOString().split("T")[0];
  } else if (date.includes("years")) {
    const now = new Date();
    const expDate = now.setFullYear(
      now.getFullYear() + parseInt(date.split(" ")[0])
    );
    return new Date(expDate).toISOString().split("T")[0];
  } else {
    return new Date(date);
  }
}

async function handlePayment(req, res) {
  try {
    console.log("BODY: ", req.body);
    console.log(req.body);
    console.log(req.body.data.object);
    console.log("[CONTROLLER][HANDLE-PAYMENT] start");
    const { email, name, phone } = req?.body?.data?.object?.customer_details;
    const { city, country, line1, line2, postal_code, state } =
      req?.body?.data?.object?.customer_details?.address;
    const isValidEmail = validator.isEmail(email);
    const amount = req?.body?.data?.object?.amount_total;
    const session = await stripe.checkout.sessions.retrieve(
      req?.body?.data?.object?.id,
      {
        expand: ["line_items"],
      }
    );
    console.log("session :", session);
    let fiscalCode = "";
    for (const field of session.custom_fields) {
      if (field.key === "codicefiscale") fiscalCode = field.text.value;
    }
    // const fiscalCode = session.custom_fields[0];
    console.log(session.line_items.data[0]);
    const quantity = session.line_items.data[0].quantity;
    const event = session.line_items.data[0].description;
    console.log("Quantity: ", quantity);
    const product = await stripe.products.retrieve(
      session.line_items.data[0].price.product
    );
    console.log("PRODUCT: ", product);
    const { when, where, giftcard, expirationDate, informations } =
      product.metadata;
    const expiration = expirationDate
      ? getExpirationDate(expirationDate)
      : undefined;
    console.log("EXPIRATION: ", expiration);
    const day = new Date(expiration).getDay();
    const month = new Date(expiration).getMonth();
    const year = new Date(expiration).getFullYear();
    console.log("DAY: ", day);
    console.log("MONTH: ", month);
    console.log("YEAR: ", year);
    let tickets = [];
    for (let x = 0; x < quantity; x++) {
      let ticket = "";
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * CHARACTERS.length);
        ticket += CHARACTERS.charAt(randomIndex);
      }
      tickets.push(ticket.toUpperCase());
    }

    let html;
    let htmlTickets = ``;
    for (let i = 0; i < tickets.length; i++) {
      htmlTickets += `<h2>${tickets[i].toUpperCase()}</h2>`;
    }
    let notified = true;
    if (isValidEmail) {
      try {
        if (giftcard) {
          html = `
        <div style="width: 100%; text-align: center;">
        <img src="${process.env.BASE_URL}/asset/logo" width="200" />
        <br /><h1>Ciao ${name.split(" ")[0]}</h1>
        <div>Grazie mille per il tuo acquisto!</div>
        <br /><h3>Bliglietti:</h3> ${htmlTickets}
        <div>Entro 48h riceverai una mail con il buono stampabile da poter regalare.</div>
        <div>Ci vediamo a Ceramichine, a presto :)</div>
        <br />
        <div><i>Non rispondere a questa mail, se hai bisogno di aiuto invia un email ad hello@ceramichine.com</i></div>
        </div>`;
          await sendEmail(email, "CERAMICHINE - Gift Card", html);
        } else {
          html = `
    <div style="width: 100%; text-align: center;">
    <img src="${process.env.BASE_URL}/asset/logo" width="200" />
    <br /><h3>Bliglietti:</h3> ${htmlTickets}
    <h4>TI ASPETTIAMO!</h4>
    <div>${where}</div>
    <div>${invertDate(when)}</div>
    ${informations ? `<div>${informations}</div>` : ""}
    <br />
    <div>Conserva questa mail ed i codici dei biglietti, ti serviranno per accedere all'evento.</div>
    <br />
    <div><i>Non rispondere a questa mail, se hai bisogno di aiuto invia un email ad hello@ceramichine.com</i></div>
    </div>`;
          await sendEmail(email, event, html);
        }
      } catch (err) {
        notified = false;
        console.error(
          "[CONTROLLER][HANDLE-PAYMENT] Error: unable to notify via Email ",
          err
        );
      }
    }
    if (!notified || !isValidEmail) {
      await sendEmail(
        process.env.EMAIL_TO_NOTIFY,
        "CERAMICHINE - ERRORE Acquisto",
        `
    <div style="width: 100%; text-align: center;">
    <img src="${process.env.BASE_URL}/asset/logo" width="200" />
    <br /><h1>ERRORE Acquisto</h1>
    <div>Non è stato possibile notificare l'acquisto di ${event} all'email: ${email}</div>
    <br /><h3>Bliglietti:</h3> ${htmlTickets}
    </div>`
      );
    } else {
      await sendEmail(
        process.env.EMAIL_TO_NOTIFY,
        "CERAMICHINE - Acquisto",
        `
    <div style="width: 100%; text-align: center;">
    <img src="${process.env.BASE_URL}/asset/logo" width="200" />
    <br /><h1>Acquisto - ${event}</h1>
    <div>${name} ha acquistato ${quantity} di ${event}</div>
    <div>Email: ${email}</div>
    <br /><h3>Bliglietti:</h3> ${htmlTickets}
    </div>`
      );
    }
    let contact;
    if (isValidEmail) {
      contact = await hubspot.searchFromHubspot("contacts", [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email,
            },
          ],
        },
      ]);
      const contactData = {
        firstname: name.split(" ")[0],
        lastname: name.replace(name.split(" ")[0], "").trim(),
        phone,
        city,
        country,
        address: line1,
        zip: postal_code,
        state,
        fiscal_code: fiscalCode,
      };
      if (!contact) {
        console.log("Create Contact: ", email);
        contact = await hubspot.createToHubspot("contacts", {
          email,
          ...contactData,
        });
      } else {
        console.log("Update Contact: ", email);
        await hubspot.updateToHubspot("contacts", contact.id, contactData);
      }
    }
    for (let i = 0; i < tickets.length; i++) {
      console.log("Create Deal: ", tickets[i]);
      const deal = await hubspot.createToHubspot("deals", {
        dealname: tickets[i],
        ticket: tickets[i],
        amount: (amount / 100 / quantity).toFixed(2),
        expiration_date: expiration
          ? new Date(expiration).getTime()
          : undefined,
        gift_card: giftcard,
        event_name: giftcard ? undefined : event,
        where,
        when: new Date(when).getTime() - 1000 * 60 * 60,
        informations,
        err_email: !isValidEmail || !notified ? email : "",
      });
      if (isValidEmail) {
        await hubspot.createAssociatonsDealToContactHubspot(
          "deals",
          deal.id,
          "contacts",
          contact.id
        );
      }
    }
    console.log("[CONTROLLER][HANDLE-PAYMENT] end");
    return res.status(200).send();
  } catch (err) {
    console.error("[CONTROLLER][HANDLE-PAYMENT] error", err);
    return res.status(500).send();
  }
}

const generateEvent = async (req, res) => {
  try {
    console.log("[CONTROLLER][GENERATE-EVENT] start");
    const { event, description, where, when, amount, informations } =
      req.body;
    if (!event || !where || !when) {
      return res.status(400).json({
        message: "Completa tutti i campi",
        status: 400,
      });
    }
    if (!isValidDateTimeFormat(when)) {
      return res.status(400).json({
        message: "Formato data non valido, formato atteso: MM/DD/YYYY HH:mm",
        status: 400,
      });
    }
    /*
    if (amount) {
      const price = await stripe.prices.create({
        product: process.env.STRIPE_PRODUCT_ID, // ID del prodotto esistente
        unit_amount: parseInt(amount) * 100, // Prezzo in centesimi
        currency: "eur", // o la valuta che intendi usare
      });
      console.log("Product Price: ", price);
    }
    */
    //const productUpdated = await stripe.products.update(
    //  process.env.STRIPE_PRODUCT_ID,
    //  {
    //    name: event,
    //    description,
    //    metadata: { where, when },
    //  }
    //);
    //console.log("Product Updated: ", productUpdated);
    console.log("[CONTROLLER][GENERATE-EVENT] end");
    const giftcardLink = `${
      process.env.BASE_URL
    }/html/giftcard?event=${encodeURIComponent(
      event
    )}&where=${encodeURIComponent(where)}&when=${encodeURIComponent(when)}`;
    return res.status(200).send({
      message: giftcardLink,
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: "Ops c'è stato un problema!", status: 500 });
  }
};

module.exports = {
  handlePayment,
  generateEvent,
};
