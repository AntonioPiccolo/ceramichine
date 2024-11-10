const hubspotConnector = require("./hubspotConnection");
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

const getFromHubspot = async (
  objectType,
  objectId,
  properties = null,
  associations = null
) => {
  if (isNaN(parseInt(objectId))) {
    throw new Error(`Invalid objectId: ${JSON.stringify(objectId)}`);
  }

  let request = {
    method: `get`,
    path: `/crm/v3/objects/${objectType}/${objectId}`,
    qs: {},
  };
  if (properties !== null) {
    request.qs.properties = properties.join(",");
  }
  if (associations !== null) {
    request.qs.associations = associations;
  }

  console.log(`HubspotAPI::getFromHubspot request ${JSON.stringify(request)}`);
  const hubspotConnector = await getHubspotInstance();
  const response = await hubspotConnector.apiRequest(request);
  return await response.json();
};

const getListFromHubspot = async (
  objectType,
  filterGroups,
  properties,
  sorts
) => {
  const limit = 100;
  let after = 0;
  const apiResponse = await searchFromHubspot(
    objectType,
    filterGroups,
    properties,
    after,
    limit,
    sorts
  );
  return apiResponse;
};

const searchFromHubspot = async (
  objectType,
  filterGroups,
  properties = [],
  after = 0,
  limit = 1,
  sorts = [],
  all = false
) => {
  const objectSearchRequest = {
    filterGroups: filterGroups,
    sorts: sorts,
    properties: properties,
    limit: limit,
    after: after,
  };
  const hubspotConnector = await getHubspotInstance();
  const response = await hubspotConnector.apiRequest({
    method: `post`,
    path: `/crm/v3/objects/${objectType}/search`,
    body: objectSearchRequest,
  });
  const json = await response.json();
  if (!json?.results || json.results.length == 0) {
    return null;
  }
  if (all) {
    return json.results;
  }
  return json.results[0];
};

const updateToHubspot = async (objectType, objectId, properties) => {
  const instance = await getHubspotInstance();
  const response = await instance.apiRequest({
    method: `patch`,
    path: `/crm/v3/objects/${objectType}/${objectId}`,
    body: { properties },
  });
  return await response.json();
};

const createToHubspot = async (objectType, properties) => {
  const instance = await getHubspotInstance();
  const response = await instance.apiRequest({
    method: `post`,
    path: `/crm/v3/objects/${objectType}`,
    body: { properties },
  });
  return await response.json();
};

const deleteFromHubspot = async (objectType, objectId) => {
  const response = await hubspotConnector.apiRequest({
    method: `delete`,
    path: `/crm/v3/objects/${objectType}/${objectId}`,
  });
  return response;
};

const getAssociatonsFromHubspot = async (
  objectType,
  objectId,
  toObjectType
) => {
  const response = await hubspotConnector.apiRequest({
    method: `get`,
    path: `/crm/v4/objects/${objectType}/${objectId}/associations/${toObjectType}`,
  });
  return response;
};

let mappingAssociations = {};

const clearAssociations = () => {
  mappingAssociations = {};
};

const getAssociationsMapping = async (fromObjectType, toObjectType) => {
  if (typeof mappingAssociations[fromObjectType] === "undefined") {
    mappingAssociations[fromObjectType] = {};
  }
  if (
    typeof mappingAssociations[fromObjectType][toObjectType] === "undefined" ||
    mappingAssociations[fromObjectType][toObjectType].length == 0
  ) {
    mappingAssociations[fromObjectType][toObjectType] = [];
    const result = await hubspotConnector.apiRequest({
      method: `GET`,
      path: `/crm/v4/associations/${fromObjectType}/${toObjectType}/labels`,
    });
    console.log("RESULT: ", result);
    result.results.map(async (a) => {
      mappingAssociations[fromObjectType][toObjectType].push(a);
    });
  }
  return mappingAssociations[fromObjectType][toObjectType];
};

const getAssociationTypeId = async (fromObjectType, toObjectType, label) => {
  const associations = await getAssociationsMapping(
    fromObjectType,
    toObjectType
  );
  let typeObject = null;
  for (let a of associations) {
    if (a.label == label) {
      console.log(
        `HubspotAPI::getAssociationTypeId FromLabel typeId: ${a.typeId}`
      );
      typeObject = a;
    }
    if (label == null && a.category == "HUBSPOT_DEFINED") {
      typeObject = a;
    }
  }
  return typeObject;
};

const retriveTypeObject = async (fromObjectType, toObjectType, label) => {
  let typeObject = await getAssociationTypeId(
    fromObjectType,
    toObjectType,
    label
  );
  if (typeObject === null && label !== null) {
    console.log(
      `HubspotAPI::createAssociatonsToHubspot createLabel: ${fromObjectType}/${toObjectType}/${label}`
    );
    await hubspotConnector.apiRequest({
      method: `POST`,
      path: `/crm/v4/associations/${fromObjectType}/${toObjectType}/labels`,
      body: { label: label, name: label.replace(" ", "_") },
    });
    delete mappingAssociations[fromObjectType][toObjectType];
    typeObject = await getAssociationTypeId(
      fromObjectType,
      toObjectType,
      label
    );
  }
  return typeObject;
};

const createAssociatonsDealToContactHubspot = async (
  fromObjectType,
  fromObjectId,
  toObjectType,
  toObjectId
) => {
  const associationBody = [
    {
      associationCategory: "HUBSPOT_DEFINED",
      associationTypeId: 3,
    },
  ];
  const instance = await getHubspotInstance();
  const response = await instance.apiRequest({
    method: `PUT`,
    path: `/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}`,
    body: associationBody,
  });
  return await response.json();
};

const deleteAssociatonsToHubspot = async (
  fromObjectType,
  fromObjectId,
  toObjectType,
  toObjectId
) => {
  const associationBody = [
    {
      associationCategory: "HUBSPOT_DEFINED",
      associationTypeId: 3,
    },
  ];
  const hubspotConnector = await getHubspotInstance();
  await hubspotConnector.apiRequest({
    method: `DELETE`,
    path: `/crm/v4/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}/${toObjectId}`,
    body: associationBody,
  });
};

const mergeObjectOnHubspot = async (objectType, sourceId, mergedId) => {
  return await hubspotConnector.apiRequest({
    method: `post`,
    path: `/crm/v3/objects/${objectType}/merge`,
    body: {
      primaryObjectId: sourceId,
      objectIdToMerge: mergedId,
    },
  });
};

const getAccountInfo = async (email = null) => {
  let endpoint = "/crm/v3/owners/";
  if (email) {
    endpoint += `?email=${email}`;
  }
  return await hubspotConnector.apiRequest({
    method: "get",
    path: endpoint,
  });
};

module.exports = {
  getFromHubspot,
  searchFromHubspot,
  updateToHubspot,
  createToHubspot,
  deleteFromHubspot,
  getListFromHubspot,
  getAssociatonsFromHubspot,
  createAssociatonsDealToContactHubspot,
  deleteAssociatonsToHubspot,
  getAssociationTypeId,
  mergeObjectOnHubspot,
  clearAssociations,
  getAccountInfo,
};
