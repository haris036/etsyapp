const axios = require('axios');
const qs = require('qs');
const { MongoClient } = require("mongodb");
const username = encodeURIComponent("harisarif103");

const password = encodeURIComponent("Temp.123");

const cluster = "mycluster.u9r3f1e.mongodb.net";

let uri =

  `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
// authSource=${authSource}&authMechanism=${authMechanism}
const client = new MongoClient(uri);

const access_token = '8966655804195cffb113';

var method = History.prototype;

let payload = {
  "dataSource": "gkp",
  "country": "us",
  "currency": "usd",
  "kw": [
    "gift",
  ]
};

function History() { }
method.getHistoricalMetrices = async function (searchKeyWord) {
  payload.kw.push(searchKeyWord);
  return axios.post('https://api.keywordseverywhere.com/v1/get_keyword_data',
    qs.stringify(payload),
    {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    })
    .then(response => response.data)
    .catch(error => {
      console.error(error);
    });

}

method.getHistory = async function (email) {
  console.log(email)
  let user_histories = [];
  try {

    await client.connect();

    const database = client.db("etsy_database");
    const users = database.collection("user_history");
    const user_history_data = await users.find({ email: email });
    
    await user_history_data.forEach(doc => {
      // console.log("rrrr")
      if (doc) {
        user_histories.push(
          {
            history: {
              keyword: doc.keyword,
              searches: doc.searches,
              average_price: doc.average_price,
              competition: doc.competition,
              search_time: doc.search_time,
            },
          }
        )
      }
    })
    // console.log(user_histories)
    return user_histories
  } catch (e) {
    console.log(e)
    return e
  } finally {
    console.log("error")
    await client.close();
  }
}
module.exports = History;