const hubspot = require("../utils/hubspot");
const sendEmail = require("../utils/sendEmail");
const validator = require("validator");
const { invertDate } = require("../utils/utils");

const verify = async (req, res) => {
  try {
    console.log("[CONTROLLER][TICKET-VERIFY] start");
    const { email, firstname, lastname, city, phone, ticket, instagram } =
      req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Inserisci il campo Email", status: 400 });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Email non valida", status: 400 });
    }
    if (!firstname || !lastname || !city || !phone) {
      return res
        .status(400)
        .json({ message: "Completa tutti i campi", status: 400 });
    }
    let contact = await hubspot.searchFromHubspot("contacts", [
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
      firstname: firstname + " " + lastname,
      phone,
      city,
      instagram,
    };
    if (!contact) {
      contact = await hubspot.createToHubspot("contacts", {
        email,
        ...contactData,
      });
    } else {
      await hubspot.updateToHubspot("contacts", contact.id, contactData);
    }
    if (!ticket) {
      return res
        .status(400)
        .json({ message: "Inserisci il Codice Biglietto", status: 400 });
    }
    let deal = await hubspot.searchFromHubspot(
      "deals",
      [
        {
          filters: [
            {
              propertyName: "ticket",
              operator: "EQ",
              value: ticket,
            },
          ],
        },
      ],
      ["ticket_validation"]
    );
    if (!deal) {
      return res
        .status(403)
        .json({ message: "Biglietto NON Valido!", status: 403 });
    } else if (deal.properties.ticket_validation) {
      return res.status(403).json({
        message: `Biglietto già convalidato!`,
        status: 403,
      });
    }
    deal = await hubspot.getFromHubspot("deals", deal.id, [], ["contacts"]);
    console.log("[CONTROLLER][TICKET-VERIFY] deal", deal);
    if (deal?.associations?.contacts?.results?.length > 0) {
      for (let i = 0; i < deal.associations.contacts.results.length; i++) {
        await hubspot.deleteAssociatonsToHubspot(
          "deals",
          deal.id,
          "contacts",
          deal?.associations?.contacts?.results[i].id
        );
      }
    }
    await hubspot.createAssociatonsDealToContactHubspot(
      "deals",
      deal.id,
      "contacts",
      contact.id
    );
    await hubspot.updateToHubspot("deals", deal.id, {
      ticket_validation: new Date().getTime(),
    });
    console.log("[CONTROLLER][TICKET-VERIFY] end");
    return res.status(200).send({ message: "Ticket validato!", status: 200 });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: "Ops c'è stato un problema!", status: 500 });
  }
};

const bookEventGiftcard = async (req, res) => {
  try {
    console.log("[CONTROLLER][BOOK-EVENT-GIFTCARD] start");
    const { email, ticket, event, where, when, informations } = req.body;
    if (!ticket) {
      return res
        .status(400)
        .json({ message: "Inserisci il codice del Biglietto.", status: 400 });
    }
    if (!email) {
      return res.status(400).json({
        message: "Inserisci il campo Email.",
        status: 400,
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Email non valida", status: 400 });
    }
    if (!event || !where || !when) {
      return res.status(400).json({
        message: "Ops, c'è stato un problema, riprova più tardi.",
        status: 500,
      });
    }
    let deal = await hubspot.searchFromHubspot(
      "deals",
      [
        {
          filters: [
            {
              propertyName: "ticket",
              operator: "EQ",
              value: ticket,
            },
          ],
        },
      ],
      ["ticket_validation", "gift_card", "event_name", "expiration_date"]
    );
    if (!deal) {
      return res
        .status(403)
        .json({ message: "Biglietto NON Valido!", status: 403 });
    }
    console.log(deal);
    if (deal.properties.ticket_validation || deal.properties.event_name) {
      return res.status(403).json({
        message: `Biglietto già utilizzato.`,
        status: 403,
      });
    }
    if (!deal.properties.gift_card) {
      return res.status(403).json({
        message: `Questo biglietto non è stato acquistato tramite Gift Card.`,
        status: 403,
      });
    }
    if (new Date(deal.properties.expiration_date) <= new Date()) {
      return res.status(403).json({
        message: `Questo biglietto è scaduto.`,
        status: 403,
      });
    }
    await hubspot.updateToHubspot("deals", deal.id, {
      event_name: event,
      where,
      when: new Date(when).getTime() - 1000 * 60 * 60,
      informations,
    });
    let contact = await hubspot.searchFromHubspot("contacts", [
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
    if (!contact) {
      contact = await hubspot.createToHubspot("contacts", {
        email,
      });
    }
    deal = await hubspot.getFromHubspot("deals", deal.id, [], ["contacts"]);
    if (deal?.associations?.contacts?.results?.length > 0) {
      for (let i = 0; i < deal.associations.contacts.results.length; i++) {
        await hubspot.deleteAssociatonsToHubspot(
          "deals",
          deal.id,
          "contacts",
          deal?.associations?.contacts?.results[i].id
        );
      }
    }
    await hubspot.createAssociatonsDealToContactHubspot(
      "deals",
      deal.id,
      "contacts",
      contact.id
    );

    const html = `
    <div style="width: 100%; text-align: center;">
    <img src="${process.env.BASE_URL}/asset/logo" width="200" />
    <br /><h2>Biglietto:</h3> ${ticket}
    <h4>TI ASPETTIAMO!</h4>
    <div>${where}</div>
    <div>${invertDate(when)}</div>
    ${
      informations && informations !== "undefined"
        ? `<div>${informations}</div>`
        : ""
    }
    <br />
    <div>Conserva questa mail ed il codice del biglietto, ti servirà per accedere all'evento.</div>
    <div><i>Non rispondere a questa mail, se hai bisogno di aiuto invia un email ad hello@ceramichine.com</i></div>
    </div>`;
    await sendEmail(email, event, html);
    console.log("[CONTROLLER][BOOK-EVENT-GIFTCARD] end");
    return res.status(200).send({ message: "Evento Prenotato", status: 200 });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: "Ops c'è stato un problema!", status: 500 });
  }
};

module.exports = {
  verify,
  bookEventGiftcard,
};
