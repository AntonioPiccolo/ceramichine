const hubspot = require("../utils/hubspot");

const verify = async (req, res) => {
  try {
    console.log("[CONTROLLER][TICKET-VERIFY] start");
    console.log("BODY: ", req.body);
    const { email, firstname, lastname, city, phone, ticket } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "Inserisci il campo Email", status: 400 });
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
      firstname,
      lastname,
      phone,
      city,
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
    let deal = await hubspot.searchFromHubspot("deals", [
      {
        filters: [
          {
            propertyName: "ticket",
            operator: "EQ",
            value: ticket,
          },
        ],
      },
    ]);
    if (!deal) {
      return res
        .status(403)
        .json({ message: "Biglietto NON Valido!", status: 403 });
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
    console.log("[CONTROLLER][TICKET-VERIFY] end");
    return res.status(200).send({ message: "Ticket validato!", status: 200 });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .send({ message: "Ops c'è stato un problema!", status: 500 });
  }
};

module.exports = {
  verify,
};
