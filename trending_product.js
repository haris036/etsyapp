const fetch = require("node-fetch");
const fs = require('fs');
const History = require("./history.js");
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var method = TrendingProduct.prototype;
function TrendingProduct() { }

 async function getTrendListing(listing_id) {
    var items = [];

    
    const url = (
        'https://openapi.etsy.com/v2/listings/trending?' +
        new URLSearchParams({
            api_key: api_key_info.api_key,
            includes: 'Images,ShippingInfo,MainImage',
        }).toString()

    );



    let response = await fetch(url);
    let results = await response.json();
    // var tags_call = [];
    // var tags_data = [];
    var items = [];
    console.log(results.results);
    if (response.status == 200) {
        for (let itemIndex = 0; itemIndex < results.results.length; itemIndex++) {
        
        
        var images = [];
        let total_images = results.results[itemIndex].Images.length;
        for (let i = 0; i < total_images; i++) {
            let image = {
                listing_image_id: results.results[itemIndex].Images[i].listing_image_id,
                url_75x75: results.results[itemIndex].Images[i].url_75x75,
                url_170x135: results.results[itemIndex].Images[i].url_170x135,
                url_570xN: results.results[itemIndex].Images[i].url_570xN,
                url_fullxfull: results.results[itemIndex].Images[i].url_fullxfull,
            };
            images.push(
                image
            );
        }

       
        
        let item = {
            listing_id: results.results[itemIndex].listing_id,
            title: results.results[itemIndex].title,
            description: results.results[itemIndex].description,
            state: results.results[itemIndex].state,            
            url: results.results[itemIndex].url,
            images: images,
        };


        items.push(item);

    }

        let result = {
           trending_items: items,
        };
        // console.log(shipping_day_prices);
        return result;



    } else {
        return `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`;
    }
}

// const toObject = (map = new Map) =>
//   Array.from
//     ( map.entries()
//     , ([ k, v ]) =>
//         v instanceof Map
//           ? { key: k, value: toObject (v) }
//           : { key: k, value: v }
//     )

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
module.exports = TrendingProduct;

getTrendListing()