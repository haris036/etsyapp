const fetch = require("node-fetch");
const fs = require('fs');
const History = require("./history.js");

let tokenInfo = JSON.parse(fs.readFileSync("token.json"));
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));

var headers = new fetch.Headers();
headers.append("Content-Type", "application/x-www-form-urlencoded");
headers.append("x-api-key", api_key_info.api_key);
headers.append("Authorization", `Bearer ${tokenInfo.access_token}`);

var method = Listing.prototype;

var requestOptions = {
  method: 'GET',
  headers: headers,
  redirect: 'follow',
};


function Listing() { }

method.getListing = async function (searchKeyWord) {

  const url = (
    'https://openapi.etsy.com/v3/application/listings/active?' +
    new URLSearchParams({
      keywords: searchKeyWord,
      limit: 100,
    }).toString()
  );
  let response = await fetch(url, requestOptions);
  let results = await response.json();

  var calls = [];

  var items = [];
  var trends = [];
  if (response.status == 200) {
    var length = results.results.length;
    console.log(length)
    var Imagelisting = require("./listing_image.js");
    var john = new Imagelisting();
    var history = new History();
    let popular_tags = new Map();
    let item_pricing = new Map();
    for (let i = 0; i < length; i++) {
      calls.push(john.getListingImages(results.results[i].listing_id).then(response => {
        var images = [];
        
        for (let i = 0; i < response.results.length; i++) {
          let image = {
            listing_id: response.results[i].listing_id,
            listing_image_id: response.results[i].listing_image_id,
            created_timestamp: response.results[i].created_timestamp,
            url_75x75: response.results[i].url_75x75,
            url_170x135: response.results[i].url_170x135,
            url_570xN: response.results[i].url_570xN,
            url_fullxfull: response.results[i].url_fullxfull,
          };
          images.push(
            image
          );
        }
        let item = {
          listing_id: results.results[i].listing_id,
          user_id: results.results[i].user_id,
          shop_id: results.results[i].shop_id,
          title: results.results[i].title,
          description: results.results[i].description,
          state: results.results[i].state,
          quantity: results.results[i].quantity,
          featured_rank: results.results[i].featured_rank,
          url: results.results[i].url,
          num_favorers: results.results[i].num_favorers,
          tags: results.results[i].tags,
          materials: results.results[i].materials,
          who_made: results.results[i].who_made,
          when_made: results.results[i].when_made,
          price: results.results[i].price,
          processing_min: results.results[i].processing_min,
          processing_max: results.results[i].processing_max,
          images: images,

        };

        for (let j = 0; j < item.tags.length; j++) {

          if (!popular_tags.has(item.tags[j].toLowerCase())) {
            let tag_properties = {
              count: 0,
              processing_min: 0,
              processing_max: 0,
              photos: 0,
              price: 0,
              divisor: 0,

            }
            popular_tags.set(item.tags[j].toLowerCase(), tag_properties);
          }
          let tag_properties = popular_tags.get(item.tags[j].toLowerCase());
          tag_properties.count++;
          tag_properties.processing_min += item.processing_min;
          tag_properties.processing_max += item.processing_max;
          tag_properties.price += item.price.amount;
          tag_properties.photos += images.length;
          tag_properties.divisor += item.price.divisor,
            popular_tags.set(item.tags[j].toLowerCase(), tag_properties);
        }
        if (!item_pricing.has(item.price.amount)) {
          item_pricing.set(item.price.amount, 0);
        }
        let count = item_pricing.get(item.price.amount);
        item_pricing.set(item.price.amount, ++count);

        items.push(
          item,

        );
      }));
      if (i % 5 == 0) {
        await Promise.all(calls);
        calls.splice(0, calls.length);
      }
    }
    var historical_metrices;
    let history_call = history.getHistoricalMetrices(searchKeyWord).then(response => {

      for (let i = 0; i < response.data[0].trend.length; i++) {
        let trend = {

          month: response.data[0].trend[i].month,
          year: response.data[0].trend[i].year,
          value: response.data[0].trend[i].value,
        }
        trends.push(trend)
      }
      historical_metrices = {
        trends: trends,
        competition: response.data[0].competition,
      }

    });
    if (calls.length != 0) {
      await Promise.all(calls);
      calls.splice(0, calls.length);
    }

    await Promise.resolve(history_call);

    let result = {
      items: items,
      popular_tags: popular_tags,
      item_pricing: item_pricing,
      historical_metrices: historical_metrices
    };
    //console.log(result.historical_metrices.trends[0].month);
    return result;
  } else if (response.status == 401){


    console.log("refreshing token...");
    var history = new History();
    let popular_tags = new Map();
    let item_pricing = new Map();
    var Refreshtoken = require("./refresh_token.js");
    var john = new Refreshtoken();
    let tokenInfo = JSON.parse(fs.readFileSync("token.json"));
    headers.append("Authorization", `Bearer ${tokenInfo.access_token}`);
    requestOptions.headers.delete("Authorization");
    await john.refreshToken();
    console.log("token refreshed");
    let response = await fetch("https://openapi.etsy.com/v3/application/listings/active?", requestOptions);

    let results = await response.json();
 
    var Imagelisting = require("./listing_image.js");
    var john = new Imagelisting();
    var history = new History();
    for (let i = 0; i < results.results.length; i++) {
      calls.push(john.getListingImages(results.results[i].listing_id).then(response => {
        var images = [];

        for (let i = 0; i < response.results.length; i++) {
          let image = {
            listing_id: response.results[i].listing_id,
            listing_image_id: response.results[i].listing_image_id,
            created_timestamp: response.results[i].created_timestamp,
            url_75x75: response.results[i].url_75x75,
            url_170x135: response.results[i].url_170x135,
            url_570xN: response.results[i].url_570xN,
            url_fullxfull: response.results[i].url_fullxfull,
          };
          images.push(
            image
          );
        }
        let item = {
          listing_id: results.results[i].listing_id,
          user_id: results.results[i].user_id,
          shop_id: results.results[i].shop_id,
          title: results.results[i].title,
          description: results.results[i].description,
          state: results.results[i].state,
          quantity: results.results[i].quantity,
          featured_rank: results.results[i].featured_rank,
          url: results.results[i].url,
          num_favorers: results.results[i].num_favorers,
          tags: results.results[i].tags,
          materials: results.results[i].materials,
          who_made: results.results[i].who_made,
          when_made: results.results[i].when_made,
          price: results.results[i].price,
          processing_min: results.results[i].processing_min,
          processing_max: results.results[i].processing_max,
          images: images,

        };

        for (let j = 0; j < item.tags.length; j++) {

          if (!popular_tags.has(item.tags[j].toLowerCase())) {
            let tag_properties = {
              count: 0,
              processing_min: 0,
              processing_max: 0,
              photos: 0,
              price: 0,
              divisor: 0,

            }
            popular_tags.set(item.tags[j].toLowerCase(), tag_properties);
          }
          let tag_properties = popular_tags.get(item.tags[j].toLowerCase());
          tag_properties.count++;
          tag_properties.processing_min += item.processing_min;
          tag_properties.processing_max += item.processing_max;
          tag_properties.price += item.price.amount;
          tag_properties.photos += images.length;
          tag_properties.divisor += item.price.divisor,
            popular_tags.set(item.tags[j].toLowerCase(), tag_properties);
        }
        if (!item_pricing.has(item.price.amount)) {
          item_pricing.set(item.price.amount, 0);
        }
        let count = item_pricing.get(item.price.amount);
        item_pricing.set(item.price.amount, ++count);

        items.push(
          item,

        );
      }));
      if (i % 5 == 0) {
        await Promise.all(calls);
        calls.splice(0, calls.length);
      }
    }
    var historical_metrices;
    let history_call = history.getHistoricalMetrices(searchKeyWord).then(response => {

      for (let i = 0; i < response.data[0].trend.length; i++) {
        let trend = {

          month: response.data[0].trend[i].month,
          year: response.data[0].trend[i].year,
          value: response.data[0].trend[i].value,
        }
        trends.push(trend)
      }
      historical_metrices = {
        trends: trends,
        competition: response.data[0].competition,
      }

    });
    if (calls.length != 0) {
      await Promise.all(calls);
      calls.splice(0, calls.length);
    }

    await Promise.resolve(history_call);

    let result = {
      items: items,
      popular_tags: popular_tags,
      item_pricing: item_pricing,
      historical_metrices: historical_metrices
    };
    return result;
  } else {
    return `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`;
  }

};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
module.exports = Listing;
