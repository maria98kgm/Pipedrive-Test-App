import mongodb from "mongodb";
import dotenv from "dotenv";
import app from "./server.js";
import UsersDAO from "./api/usersDAO.js";
dotenv.config();

const MongoClient = mongodb.MongoClient;
const port = 5000;

MongoClient.connect(process.env.MONGO_URI, {
  wtimeoutMS: 2500,
  useNewUrlParser: true,
})
  .catch((err) => {
    console.log(err.stack);
    process.exit();
  })
  .then(async (client) => {
    await UsersDAO.injectDB(client);
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  });
