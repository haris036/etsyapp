const fetch = require("node-fetch");
const fs = require('fs');
const Listing = require("./listing.js");
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var headers = new fetch.Headers();
headers.append("x-api-key", api_key_info.api_key);
var method = Shop.prototype;
function Shop() { }

method.getShop = async function (shop_name) {
    
    const url = (
        'https://openapi.etsy.com/v2/shops/?' +
        new URLSearchParams({
            api_key: api_key_info.api_key,
            shop_name: shop_name,
            includes: 'About,Listings',
        }).toString()

    );



    let response = await fetch(url);
    let results = await response.json();
    var shops = [];

    if (response.status == 200) {
        var current_time = Date.now();
        current_time = Math.round(current_time / 1000);
        for (let i = 0; i < total_images; i++) {
            let shop = {
                shop_name: results.results[0].shop_name,
                status: results.results[0].About.url_75x75,
                title: results.results[0].title,
                active_listing: results.results[0].listing_active_count,
                url: results.results[0].url,
                num_favorers : results.results[0].num_favorers,
                icon_url: results.results[0].icon_url_fullxfull,
                listings: results.results[0].Listings.count,
                created_on: (current_time - results.results[0].creation_tsz) / 84600,
            };
            shops.push(
                shop
            );
        }
        let result = {
            shops: shops,
         };
        // console.log(shipping_day_prices);
        return result;



    } else {
        return `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`;
    }


}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
module.exports = Shop;