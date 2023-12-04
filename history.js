const axios = require('axios');
const qs = require('qs');
const { MongoClient } = require("mongodb");

const googleTrends = require('google-trends-api');

const username = encodeURIComponent("harisarif103");

const password = encodeURIComponent("Temp.123");

const cluster = "mycluster.u9r3f1e.mongodb.net";

let uri =

  `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
// authSource=${authSource}&authMechanism=${authMechanism}
const client = new MongoClient(uri);

// const access_token = '8966655804195cffb113';

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
  let response;
  try {

    let startTime = new Date(Date.now() - 31556926 * 1000.0)
    startTime.setHours(0);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    // console.log(startTime.toISOString())

    await googleTrends.interestOverTime({ keyword: searchKeyWord, startTime: startTime }, function (err, results) {
      if (err) {
        console.log(err)
        response = {
          status: 500,
          error_msg: err,
        };
      }
      else {
        console.log(results)
        let json_results = JSON.parse(results);
        console.log(JSON.parse(results))
        response = {
          status: 200,
          stats: json_results.default
        }
        // return json_results.default;
      };
    });
  } catch (e) {
    response = {
      status: 500,
      error_msg: e,
    }
  }
return response
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
    let response = {
      status: 200,
      user_histories: user_histories,
    }
    return response;
  } catch (e) {
    return response = {
      status: 500,
      error_msg: e,
    }
  } finally {
    await client.close();
  }
}
module.exports = History;