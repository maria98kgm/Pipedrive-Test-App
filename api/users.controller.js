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

export { getUser, refreshToken, getPersonFields, getDealFields };
