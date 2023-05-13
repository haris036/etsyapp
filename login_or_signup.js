const { MongoClient } = require("mongodb");
// const jwt = require("jsonwebtoken");
const username = encodeURIComponent("harisarif103");

const password = encodeURIComponent("Temp.123");

const cluster = "mycluster.u9r3f1e.mongodb.net";

const GenerateToken = require("./generator/token_generator")
var method = LoginOrSignup.prototype;
function LoginOrSignup() { }

let uri =

  `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
// authSource=${authSource}&authMechanism=${authMechanism}
const client = new MongoClient(uri);


method.saveUser = async function (_email, _password, _is_subscribed) {
  let usr = "";
  let insert_id = "";
  try {

    await client.connect();
    usr = _email.substr(0, _email.indexOf('@'));
    const database = client.db("etsy_database");
    console.log(usr)
    const collection = database.collection("user_data");

    const doc = {
      user: usr,
      password: _password,
      creation_time: Date.now(),
      email: _email,
      is_subscribed: _is_subscribed,
      last_updated: null,
      expiry: Date.now() + 2592000,
      subscribed_date: Date.now()
    };
    const result = await collection.insertOne(doc);

    console.log(
      `A document was inserted with the _id: ${result.insertedId}`,
    );
    insert_id = result.insertedId;
  } catch (e) {
    if (e.code === 11000) {
      return "User already exists with same email id"
    }
    else {
      return (e)
    }
  } finally {

    await client.close();

  }
  let response = {
    user: usr,
    inserted_id: insert_id,
  }
  return response;
}

method.updateUserPassword = async function (_email, _password) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        password: _password,
        last_updated: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);

  } catch (e) {
    return e
  } finally {
    await client.close();
  }
  let response = {
    msg: "Updated",
  }
  return response;
}

method.updateSubscription = async function (_email, _is_subscribed) {

  try {

    await client.connect();
    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        is_subscribed: _is_subscribed,
        last_updated: Date.now(),
        subscribed_date: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);
  } catch (e) {
    return e
  } finally {

    await client.close();

  }
  let response = {
    msg: "Updated",
  }
  return response;
}


method.getUser = async function (_email, _password) {

  let user_info;
  try {

    await client.connect();

    const database = client.db("etsy_database");
    const users = database.collection("user_data");
    console.log(_email);
    const user_data = await users.findOne({ email: _email });
    let response;
    console.log(user_data)
    var tokenGenerator = new GenerateToken();
    if (user_data.password == _password) {
      response = tokenGenerator.getToken(_email);
    }

    user_info = {
      email: user_data.email,
      access_token: response.access_token,
      refresh_token: response.refresh_token,
    }
    console.log(user_info)
  } catch (e) {
    console.log(e)
    return e
  } finally {

    await client.close();

  }

  return user_info;
}

method.updateCountry = async function (_email, _country, ) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        country: _country,
        last_updated: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);

  } catch (e) {
    return e
  } finally {

    await client.close();

  }

  return user_info;
}


method.updateDateOfBirth = async function (_email, _date_of_birth) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        date_of_birth: _date_of_birth,
        last_updated: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);

  } catch (e) {
    return e
  } finally {

    await client.close();

  }

  return user_info;
}


method.updateContactNo = async function (_email, _contact_no) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        contact_no: _contact_no,
        last_updated: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);

  } catch (e) {
    return e
  } finally {

    await client.close();

  }

  return user_info;
}

method.deleteAccount = async function (_email,) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    await dbo.collection("user_data").deleteOne(myquery,)


  } catch (e) {
    return e
  } finally {
    await client.close();
  }
  let response = {
    msg: "Updated",
  }
  return response;
}

method.forgotPassword = async function (_email,) {

  let user_info;
  try {

    await client.connect();

    const database = client.db("etsy_database");
    const users = database.collection("user_data");
    const user_data = await users.findOne({ email: _email });
    var tokenGenerator = new GenerateToken();
    let response = tokenGenerator.getResetPasswordToken(_email);
    user_info = {
      access_token: response.access_token,
    }
    console.log(user_info)
    var EmailHelper = require("./helper/email_helper.js");
    var john = new EmailHelper();
    // console.log(req.session);
    // console.log(req)
    response = await john.resetPasswordEmail(_email, user_info.access_token, user_info.access_token);

    const doc = {
      email: _email,
      reset_password: user_info.access_token,
      upsert: true,
    };
    const tokens = database.collection("user_tokens");

    const result = await tokens.replaceOne(doc);


    // console.log(response);
  } catch (e) {
    return e
  } finally {
    await client.close();
  }
  let response = {
    msg: "email generated",
  }
  return response;
}


// getUser("zkh").catch(console.dir);
// saveUser("zkh@gmail.com", "Temp.123", "N").catch(console.dir);
// updateUserPassword("zkh", "Temp.1234")
module.exports = LoginOrSignup;
