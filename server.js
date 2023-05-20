import express from "express";
import passport from "passport";
import { OAuth2Strategy } from "passport-oauth";
import { getUser, refreshToken } from "./api/users.controller.js";
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
  const newUserData = await refreshToken(user.data.refresh_token);
  const updatedUser = await UsersDAO.putUser(
    newUserData.data.company_domain,
    newUserData.data.token,
    newUserData.data.refresh_token
  );
  res.json({ user: user, newUserData: newUserData, updatedUser: updatedUser });
});

export default app;
