const querystring = require("querystring");
const hubspot = require("@hubspot/api-client");

let hsInstance = null;

const getHubspotInstance = async () => {
  if (hsInstance === null) {
    console.log(
      "HubspotAPI::getHubspotInstance - Creating new instance",
      process.env.HUBSPOT_ACCESS_TOKEN
    );
    hsInstance = new hubspot.Client({
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
    });
  }
  return hsInstance;
};

const refreshInstance = () => {
  hsInstance = null;
  return true;
};

const setHubspotInstanceAccessToken = (accessToken) => {
  hsInstance = new hubspot.Client({
    accessToken,
  });
  return true;
};

/**
 * Wrapper to Hubspot API request, which tries to run request several times, in case of Hubspot timeout errors
 * @param request - Hubspot request object, which usually passed to apiRequest Hubspot function
 * @param attempt - Number of attempt to run this request
 * @return {Promise<*>}
 */
const apiRequest = async (request) => {
  try {
    if (!request.method) {
      throw new Error("HubspotAPI::apiRequest - request.method is required");
    }
    if (!request.path) {
      throw new Error("HubspotAPI::apiRequest - request.path is required");
    }

    if (request.qs) {
      const queryParams = querystring.stringify(request.qs);
      request.path = request.path + "?" + queryParams;
    }

    console.log(`HubspotAPI::apiRequest - request: ${JSON.stringify(request)}`);
    const hsConnection = await getHubspotInstance();
    const response = await hsConnection.apiRequest(
      request.method,
      request.path,
      request.body ?? null
    );
    console.log(response.status, response.statusText);
    return await response.json();
  } catch (error) {
    console.warn(`HubspotAPI::apiRequest Error ${error.message}`);
    console.log(
      `HubspotAPI::apiRequest Error ${
        error.message
      } for request: ${JSON.stringify(request)}`
    );
    throw error;
  }
};

module.exports = {
  getHubspotInstance,
  refreshInstance,
  setHubspotInstanceAccessToken,
  apiRequest,
};
