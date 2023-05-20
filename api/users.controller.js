async function getUser(accessToken) {
  return await fetch("https://api.pipedrive.com/v1/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json());
}

async function getDeals(accessToken) {
  const requestOptions = {
    uri: "https://api.pipedrive.com/v1/deals",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    qs: { status: "open" },
    json: true,
  };
  const deals = await request(requestOptions);

  return deals;
}

async function updateDeal(id, outcome, accessToken) {
  const requestOptions = {
    uri: `https://api.pipedrive.com/v1/deals/${id}`,
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    json: {
      status: outcome,
    },
  };

  await request(requestOptions);
}

async function refreshToken(refreshToken) {
  return await fetch("https://oauth.pipedrive.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
  }).then((res) => res.json());
}

export { getUser, getDeals, updateDeal, refreshToken };
