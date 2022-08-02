const fetch = require("node-fetch");
const fs = require('fs');

let tokenInfo = JSON.parse(fs.readFileSync("token.json"));
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var headers = new fetch.Headers();
headers.append("Content-Type", "application/x-www-form-urlencoded");
headers.append("x-api-key", api_key_info.api_key);
headers.append("Authorization", `Bearer ${tokenInfo.access_token}`);

var method = Imageslisting.prototype;


var requestOptions = {
    method: 'GET',
    headers: headers,
    redirect: 'follow',

};

function Imageslisting() {}

method.getListingImages = async function (searchKeyWord) {
    const url = (
        'https://openapi.etsy.com/v3/application/listings/' + searchKeyWord + '/images?'
    );

    return await fetch(url, requestOptions).then(response => response.json());
};

module.exports = Imageslisting;