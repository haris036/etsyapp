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
    .then(response =>response.data)
    .catch(error => {
      console.error(error);
    });
    
}

method.getHistory = async function(email)  {

  let user_history_ = [];
  try {

    await client.connect();

    const database = client.db("etsy_database");
    const users = database.collection("user_history");
    const user_history = await users.find({ email: email });
    
    const results = user_history.forEach(function(err, doc){
      if (doc){
        user_history_.push (
          {
             history :{
              
              keyword : user_history.keyword,
              searches: user_history.searches,
              average_price: user_history.average_price,
              competition: user_history.competition,

            },
          }
          
        )
      } else {
        return err;
      }
    })
    var tokenGenerator = new GenerateToken();
    if (user_data[0].password == _password) {
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
}
module.exports = History;