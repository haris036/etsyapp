const axios = require('axios');
const qs = require('qs');

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

module.exports = History;