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

export {
  getUser,
  refreshToken,
  getPersonFields,
  getDealFields,
  createPersonField,
  createDealField,
  updatePersonField,
  updateDealField,
};
