const fetch = require("node-fetch");
const fs = require('fs');
var method = Refreshtoken.prototype;

function Refreshtoken() {}
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
let tokenInfo = JSON.parse(fs.readFileSync("token.json"));
var requestOptions = {
    method: 'POST',
    body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: api_key_info.api_key,
        refresh_token: tokenInfo.refresh_token,
    }),
    headers: {
        'Content-Type': 'application/json'
    }
};
method.refreshToken = async function () {
    const response = await fetch("https://api.etsy.com/v3/public/oauth/token?", requestOptions);


    const results = await response.json();
    console.log(results);
    fs.writeFileSync("token.json", JSON.stringify(results));
    
}

module.exports = Refreshtoken;