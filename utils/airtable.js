const axios = require("axios");

async function create(table, data) {
  await axios.post(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASEID}/${table}`,
    {
      fields: data,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.info("[UTILS][AIRTABLE][CREATE] success");
}

module.exports = {
  create,
};
