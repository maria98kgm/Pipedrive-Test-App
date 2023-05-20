import express from "express";
import passport from "passport";
import { OAuth2Strategy } from "passport-oauth";
import { getUser, refreshToken, getPersonFields, getDealFields } from "./api/users.controller.js";
import UsersDAO from "./api/usersDAO.js";

const app = express();

const clientID = process.env.CLIENT_ID || "<YOUR_CLIENT_ID>";
const clientSecret = process.env.CLIENT_SECRET || "<YOUR_CLIENT_SECRET>";
const callbackURL = process.env.CALLBACK_URL || "<YOUR_CALLBACK_URL>";

passport.use(
  "pipedrive",
  new OAuth2Strategy(
    {
      authorizationURL: "https://oauth.pipedrive.com/oauth/authorize",
      tokenURL: "https://oauth.pipedrive.com/oauth/token",
      clientID: clientID || "",
      clientSecret: clientSecret || "",
      callbackURL: callbackURL || "",
    },
    async (accessToken, refreshToken, profile, done) => {
      const userInfo = await getUser(accessToken);
      await UsersDAO.postUser(userInfo.data, accessToken, refreshToken);
      done(null, userInfo.data);
    }
  )
);

app.use(passport.initialize());

app.get("/auth/pipedrive/callback", function (req, res, next) {
  passport.authenticate("pipedrive", function (err, user) {
    if (err) return next(err);
    if (!user) return res.redirect("https://www.pipedrive.com/");
    return res.redirect(`https://${user.company_domain}.pipedrive.com/`);
  })(req, res, next);
});

app.get("/user", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.domain_name);
  res.json({ user: user });
});

app.get("/refresh_token", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.domain_name);
  const newUserData = await refreshToken(user.refresh_token);
  await UsersDAO.putUser(user.company_domain, newUserData.access_token, newUserData.refresh_token);
  res.json({ token: newUserData.access_token });
});

app.get("/person_fields", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.domain_name);
  console.log("dddddddddd", user);
  const personFields = await getPersonFields(user.domain_name, user.token);

  res.json({ personFields: personFields });
});

app.get("/deal_fields", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.domain_name);
  const personFields = await getDealFields(user.domain_name, user.token);

  res.json({ dealFields: personFields });
});

export default app;
