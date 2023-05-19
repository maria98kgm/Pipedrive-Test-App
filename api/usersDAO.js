let users;

export default class UsersDAO {
  static async injectDB(conn) {
    if (users) {
      return;
    }

    try {
      users = await conn.db(process.env.USERS_NS).collection("restaurants");
    } catch (err) {
      console.log(`Unable to establish a connection handle in usersDAO: ${err}`);
    }
  }

  static async postUser(user, token, refreshToken) {
    try {
      const userDoc = {
        user_id: user._id,
        name: user.name,
        company_domain: user.company_domain,
        token: token,
        token: refreshToken,
        date: new Date(new Date().getTime() + 3600000),
      };

      return await users.insertOne(userDoc);
    } catch (err) {
      console.error(`Unable to post review: ${err}`);
      return { error: err };
    }
  }
}
