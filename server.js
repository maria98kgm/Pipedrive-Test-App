const express = require("express");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth").OAuth2Strategy;
const config = require("./config");

const app = express();

passport.use(
  "pipedrive",
  new OAuth2Strategy(
    {
      authorizationURL: "https://oauth.pipedrive.com/oauth/authorize",
      tokenURL: "https://oauth.pipedrive.com/oauth/token",
      clientID: config.clientID || "",
      clientSecret: config.clientSecret || "",
      callbackURL: config.callbackURL || "",
    },
    async (accessToken, refreshToken, profile, done) => {
      // const userInfo = await api.getUser(accessToken);
      // const user = await User.add(userInfo.data.name, accessToken, refreshToken);
      done();
    }
  )
);

app.use(passport.initialize());

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
