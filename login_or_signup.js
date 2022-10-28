// const { MongoClient } = require("mongodb");
// // Connection URI
// const uri =
//   "mongodb+srv://harisarif103:Temp.123@mycluster.u9r3f1e.mongodb.net/?retryWrites=true&w=majority";
// // Create a new MongoClient
// const client = new MongoClient(uri);
// async function run() {
//   try {
//     // Connect the client to the server (optional starting in v4.7)
//     await client.connect();
//     // Establish and verify connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Connected successfully to server");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);


const { MongoClient } = require("mongodb");

const username = encodeURIComponent("harisarif103");

const password = encodeURIComponent("Temp.123");

const cluster = "mycluster.u9r3f1e.mongodb.net";

// const authSource = "<authSource>";

// const authMechanism = "<authMechanism>";

var method = LoginOrSignup.prototype;
function LoginOrSignup() { }

let uri =

  `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
// authSource=${authSource}&authMechanism=${authMechanism}
const client = new MongoClient(uri);

method.getUser = async function (_email) {
  let user_data = [];
  try {

    await client.connect();

    const database = client.db("etsy_database");

    const ratings = database.collection("user_data");
    const cursor = ratings.find({ email: _email });

    await cursor.forEach(doc => user_data.push(doc));

  } catch (e) {
    console.log(e)
  } finally {

    await client.close();

  }

  return user_data;
}


method.saveUser = async function ( _email,  _password, _is_subscribed) {
  let usr = "";
  try {

    await client.connect();
    usr = _email.substr(0,_email.indexOf('@'));
    const database = client.db("etsy_database");
    console.log(usr)
    const collection = database.collection("user_data");

    const doc = { user: usr, password: _password, creation_time: Date.now(), email: _email, is_subscribed: _is_subscribed, last_updated: null, expiry: Date.now() + 2592000 };
    const result = await collection.insertOne(doc);
    console.log(
      `A document was inserted with the _id: ${result.insertedId}`,
    );

  } catch (e) {
    console.log(e)
  } finally {

    await client.close();

  }
  let response = {
    user: usr,
    inserted_id: insertedId
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
    console.log(e)
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
    console.log(e)
  } finally {

    await client.close();

  }
  let response = {
    msg: "Updated",
  }
  return response;
}

// getUser("zkh").catch(console.dir);
// saveUser("zkh@gmail.com", "Temp.123", "N").catch(console.dir);
// updateUserPassword("zkh", "Temp.1234")
module.exports = LoginOrSignup;
