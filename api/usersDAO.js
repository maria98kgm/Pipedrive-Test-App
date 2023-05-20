let users;

export default class UsersDAO {
  static async injectDB(conn) {
    if (users) {
      return;
    }

    try {
      users = await conn.db(process.env.USERS_NS).collection("users");
    } catch (err) {
      console.log(`Unable to establish a connection handle in usersDAO: ${err}`);
    }
  }

  static async getUser(company_domain) {
    try {
      const pipeline = [
        {
          $match: {
            company_domain: company_domain,
          },
        },
      ];

      return await users.aggregate(pipeline).next();
    } catch (err) {
      console.error(`Unable to get user: ${err}`);
      return { error: err };
    }
  }

  static async postUser(user, token, refreshToken) {
    try {
      const userDoc = {
        user_id: user.id,
        name: user.name,
        company_domain: user.company_domain,
        token: token,
        refresh_token: refreshToken,
        date: new Date(new Date().getTime() + 3600000),
      };

      return await users.insertOne(userDoc);
    } catch (err) {
      console.error(`Unable to post user: ${err}`);
      return { error: err };
    }
  }

  static async putUser(company_domain, newToken, newRefreshToken) {
    try {
      const userToUpdate = { company_domain: company_domain };
      const updateUser = await users.updateOne(userToUpdate, {
        $set: { token: newToken, refresh_token: newRefreshToken },
      });

      return updateUser;
    } catch (err) {
      console.error(`Unable to update user: ${err}`);
      return { error: err };
    }
  }
}
