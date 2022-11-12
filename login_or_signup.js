const { MongoClient } = require("mongodb");

const username = encodeURIComponent("harisarif103");

const password = encodeURIComponent("Temp.123");

const cluster = "mycluster.u9r3f1e.mongodb.net";

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

    const doc = { user: usr, password: _password, creation_time: Date.now(), email: _email, is_subscribed: _is_subscribed, last_updated: null, expiry: Date.now() + 2592000 };
    const result = await collection.insertOne(doc);

    console.log(
      `A document was inserted with the _id: ${result.insertedId}`,
    );
    insert_id = result.insertedId;
  } catch (e) {
    if ( e.code === 11000) {
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
    inserted_id: insert_id
  }
  return response;
}

method.updateUserPassword = async function (_email, _password) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = { $set: { password: _password, last_updated: Date.now() } };
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
    var newvalues = { $set: { is_subscribed: _is_subscribed, last_updated: Date.now() } };
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


method.getUser = async function (_email) {
  let user_data = [];
  try {

    await client.connect();

    const database = client.db("etsy_database");

    const ratings = database.collection("user_data");
    const cursor = ratings.find({ email: _email });

    await cursor.forEach(doc => user_data.push(doc));

  } catch (e) {
    return e
  } finally {

    await client.close();

  }

  return user_data;
}


// getUser("zkh").catch(console.dir);
// saveUser("zkh@gmail.com", "Temp.123", "N").catch(console.dir);
// updateUserPassword("zkh", "Temp.1234")
module.exports = LoginOrSignup;
