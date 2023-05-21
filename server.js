import express from "express";
import passport from "passport";
import { OAuth2Strategy } from "passport-oauth";
import cors from "cors";
import {
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
} from "./api/users.controller.js";
import UsersDAO from "./api/usersDAO.js";

const app = express();

const clientID = process.env.CLIENT_ID || "<YOUR_CLIENT_ID>";
const clientSecret = process.env.CLIENT_SECRET || "<YOUR_CLIENT_SECRET>";
const callbackURL = process.env.CALLBACK_URL || "<YOUR_CALLBACK_URL>";

app.use(cors());

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
  const user = await UsersDAO.getUser(req.query.user_id);
  res.json({ user: user });
});

app.get("/refresh_token", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const newUserData = await refreshToken(user.refresh_token);
  await UsersDAO.putUser(user.user_id, newUserData.access_token, newUserData.refresh_token);
  res.json({ token: newUserData.access_token });
});

app.get("/person_fields", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const personFields = await getPersonFields(user.token);

  res.json({ personFields: personFields });
});

app.get("/deal_fields", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const dealFields = await getDealFields(user.token);

  res.json({ dealFields: dealFields });
});

app.get("/create_person_field", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const apiRes = await createPersonField(user.token, req.query.fieldName, req.query.fieldType);

  res.json({ res: apiRes });
});

app.get("/create_deal_field", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const apiRes = await createDealField(user.token, req.query.fieldName, req.query.fieldType);

  res.json({ res: apiRes });
});

app.get("/update_person_field", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const apiRes = await updatePersonField(
    user.token,
    req.query.dealId,
    req.query.fieldKey,
    req.query.fieldVal
  );

  res.json({ res: apiRes });
});

app.get("/update_deal_field", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const apiRes = await updateDealField(
    user.token,
    req.query.dealId,
    req.query.fieldKey,
    req.query.fieldVal
  );

  res.json({ res: apiRes });
});

app.get("/get_person_detail", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const apiRes = await getPersonDetails(user.token, req.query.dealId);

  res.json({ res: apiRes });
});

app.get("/get_deal_detail", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const apiRes = await getDealDetails(user.token, req.query.dealId);

  res.json({ res: apiRes });
});

app.get("/create_note", async (req, res) => {
  const user = await UsersDAO.getUser(req.query.user_id);
  const apiRes = await postNote(user.token, req.query.dealId, req.query.content);

  res.json({ res: apiRes });
});

export default app;
