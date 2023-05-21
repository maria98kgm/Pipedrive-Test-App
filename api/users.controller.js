const clientID = process.env.CLIENT_ID || "<YOUR_CLIENT_ID>";
const clientSecret = process.env.CLIENT_SECRET || "<YOUR_CLIENT_SECRET>";

async function getUser(accessToken) {
  return await fetch("https://api.pipedrive.com/v1/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());
}

async function refreshToken(refreshToken) {
  const bodyParams = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  };
  const urlEncoded = new URLSearchParams(Object.entries(bodyParams)).toString();

  return await fetch("https://oauth.pipedrive.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(clientID + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: urlEncoded,
  }).then((res) => res.json());
}

async function getPersonFields(accessToken) {
  return await fetch(`https://api.pipedrive.com/v1/personFields`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());
}

async function getDealFields(accessToken) {
  return await fetch(`https://api.pipedrive.com/v1/dealFields`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());
}

async function createPersonField(accessToken, fieldName, fieldType) {
  const body = {
    name: fieldName,
    field_type: fieldType,
  };

  return await fetch(`https://api.pipedrive.com/v1/personFields`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

async function createDealField(accessToken, fieldName, fieldType) {
  const body = {
    name: fieldName,
    field_type: fieldType,
  };

  return await fetch(`https://api.pipedrive.com/v1/dealFields`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

async function updatePersonField(accessToken, dealId, fieldKey, fieldVal) {
  const body = { [fieldKey]: fieldVal };

  return await fetch(`https://api.pipedrive.com/v1/persons/${dealId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

async function updateDealField(accessToken, dealId, fieldKey, fieldVal) {
  const body = { [fieldKey]: fieldVal };

  return await fetch(`https://api.pipedrive.com/v1/deals/${dealId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

async function getPersonDetails(accessToken, dealId) {
  return await fetch(`https://api.pipedrive.com/v1/persons/${dealId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());
}

async function getDealDetails(accessToken, dealId) {
  return await fetch(`https://api.pipedrive.com/v1/deals/${dealId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());
}

async function postNote(accessToken, dealId, content) {
  const body = { deal_id: dealId, content: content };

  return await fetch("https://api.pipedrive.com/v1/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  }).then((res) => res.json());
}

const fields = [
  "Job type",
  "Job source",
  "Job description",
  "Job date",
  "Job start time",
  "Job end time",
  "Address",
  "Area",
];

async function createJobFields(accessToken, currentDealFields, arr = fields) {
  const fieldPresent = currentDealFields.find((item) => item.name === arr[0]);
  if (!fieldPresent) {
    return await createDealField(accessToken, arr[0], "text").then((res) => {
      if (arr.length > 1) createJobFields(accessToken, currentDealFields, arr.slice(1));
    });
  }
  if (arr.length > 1) return createJobFields(accessToken, currentDealFields, arr.slice(1));
  return;
}

export {
  getUser,
  refreshToken,
  getPersonFields,
  getDealFields,
  createPersonField,
  createDealField,
  updatePersonField,
  updateDealField,
  getPersonDetails,
  getDealDetails,
  postNote,
  createJobFields,
};
