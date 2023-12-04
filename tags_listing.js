const fetch = require("node-fetch");
const fs = require('fs');
const History = require("./history.js");
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
// const { MongoClient } = require("mongodb");
// const { count } = require("console");
// const username = encodeURIComponent("harisarif103");

// const password = encodeURIComponent("Temp.123");

// const cluster = "mycluster.u9r3f1e.mongodb.net";

// let uri =
//   `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
// // authSource=${authSource}&authMechanism=${authMechanism}

// const client = new MongoClient(uri);
var method = TagListing.prototype;
function TagListing() { }


method.getTagListing = async function (searchKeyWord, api_key) {
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-api-key", api_key);
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
  // console.log(requestOptions);
  const urlGetActiveListings = (
    'https://openapi.etsy.com/v3/application/listings/active?' +
    new URLSearchParams({
      // api_key: api_key_info.api_key,
      keywords: searchKeyWord,
      limit: 100,
      // sort_on: "created",
      // includes: 'Images,ShippingInfo,MainImage'
    }).toString()

  );

  let min_max_shipping_days = "";
  try {

    var searches = 0;
    var favourites = 0;
    var average_price = 0.0;


    let response = await fetch(urlGetActiveListings, requestOptions);
    let results = await response.json();
    var listing_ids = [];
    if (response.status == 200) {
      var length = results.results.length;
      var competition = results.count;
      for (let item of results.results) {
        listing_ids.push(item.listing_id)
      }
    }

    else {
      return `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`;
    }
    // console.log(listing_ids);

    const urlBatchListingIds = (
      'https://openapi.etsy.com/v3/application/listings/batch?' +
      new URLSearchParams({
        // api_key: api_key_info.api_key,
        listing_ids: listing_ids,
        includes: 'Images,Shipping',
      }).toString()

    );
    // console.log(urlBatchListingIds)
    response = await fetch(urlBatchListingIds, requestOptions);
    results = await response.json();

    if (response.status == 200) {
      var competition = results.count;
      var current_time = Date.now();
      current_time = Math.round(current_time / 1000);
      var length = results.results.length;
      let _items = results.results;
      var _count = 0;
      console.log(length);
      let max_shipping_item_day = null;
      let min_shipping_item_day = null;
      let total_images = 0;
      for (let _item of _items) {
        //console.log(_item)
        searches += _item.views;
        _count += 1;
        if (_item.images) {
          total_images = _item.images.length;

          for (let shipping_profile_destinations of _item.shipping_profile.shipping_profile_destinations) {

            if (shipping_profile_destinations.min_delivery_days != null && shipping_profile_destinations.max_delivery_days != null) {

              if (min_shipping_item_day == null || min_shipping_item_day > shipping_profile_destinations.min_delivery_days) {
                min_shipping_item_day = shipping_profile_destinations.min_delivery_days;
              }

              if (max_shipping_item_day == null || max_shipping_item_day < shipping_profile_destinations.max_delivery_days) {
                max_shipping_item_day = shipping_profile_destinations.max_delivery_days;
              }

            }
          }
        }
        
        if (min_shipping_item_day != null) {
          min_max_shipping_days = min_shipping_item_day + "";
        }

        if (max_shipping_item_day != null) {

          if (min_max_shipping_days != null) {
            min_max_shipping_days = min_max_shipping_days + "-";
          }
          min_max_shipping_days = min_max_shipping_days + max_shipping_item_day;
        }
        average_price += parseFloat(_item.price.amount / _item.price.divisor);
        favourites += parseInt(_item.num_favorers);

      }

      let result = {
        status: 200,
        competition: competition,
        photos: total_images,
        avg_searches: searches / length,
        searches: searches,
        favourites: favourites,
        average_price: average_price / length,
        min_max_shipping_days: min_max_shipping_days,
      };

      let _response = {
        status: 200,
        result: result,
      }
      return _response;
    }

    else {

      let _response = {
        status: 500,
        error_msg: `Error in getting tag listing results received respose code: ${response.status} response description: ${response.statusText}`,

      }
      console.log(_response)
      return _response;
    }

  } catch (e) {
    let _response = {
      status: 500,
      error_msg: e,
    }
    console.log(_response)
    return _response;
  }
};



function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


module.exports = TagListing;