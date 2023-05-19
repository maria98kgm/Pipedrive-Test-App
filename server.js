import express from "express";
import passport from "passport";
import { OAuth2Strategy } from "passport-oauth";
import { getUser } from "./api/users.controller.js";
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
      done(null, userInfo);
    }
  )
);

app.use(passport.initialize());

app.get("/", (req, res) => {
  // res.redirect("https://stackoverflow.com/");
  console.log(req.userInfo);
  console.log(req);
});
app.get("/auth/pipedrive", passport.authenticate("pipedrive"));
app.get(
  "/auth/pipedrive/callback",
  passport.authenticate("pipedrive", {
    session: false,
    failureRedirect: "/",
    successRedirect: "/",
  })
);

export default app;
