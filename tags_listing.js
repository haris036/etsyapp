const fetch = require("node-fetch");
const fs = require('fs');
require('dotenv').config()
const History = require("./history.js");
// const { response } = require("express");
const api_keys = process.env.API_KEYS.split(',')
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
let keyword = "";
method.getTagListing = async function (searchKeyWord, start_index, option) {
  console.log(option)
  keyword = searchKeyWord;
  var myHeaders = new fetch.Headers();
  myHeaders.append("x-api-key", api_keys[2]);


  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
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
  let response = {
    status: 200
  }
  try {
    let call_response = await fetch(urlGetActiveListings, requestOptions);
    let results = await call_response.json();
    // let long_tail_keyword = searchKeyWord.indexOf(' ') >= 3;
    let tag_list_map = new Map();
    let tag_lists = [];
    var popular_tags_map = new Map();
    var long_tail_alternatives_map = new Map();
    var similar_shopper_searches_map = new Map();


    if (call_response.status == 200) {
      let popular_tags_calls = [];
      for (let item of results.results) {

        for (let tag of item.tags) {
          if (!tag_list_map.has(tag.toLowerCase())) {
            // console.log(tag.toLowerCase())
            tag_list_map.set(tag.toLowerCase(), 0)
            tag_lists.push(tag.toLowerCase());
          }
          tag_list_map.set(tag.toLowerCase(), tag_list_map.get(tag.toLowerCase()) + 1);

        }

      }

      let mapSort1 = new Map([...tag_list_map.entries()].sort((a, b) => b[1] - a[1]));

      if (option == 1) {
        let keys = Array.from(mapSort1.keys());
        if (keys.length <= start_index) {
          return response = {
            status: 500,
            error: `Invalid index provided count  ${keys.length}`,
          };
        }
        let ending_index = start_index + 10;
        console.log(ending_index)
        if (ending_index > keys.length) {
          ending_index = keys.length;
        }
        console.log(ending_index)
        // console.log(mapSort1)
        for (let j = start_index; j < ending_index; j++) {
          // console.log(key.toLowerCase())
          if (!popular_tags_map.has(keys[j].toLowerCase())) {
            let tag_properties = {
              count: mapSort1.get(keys[j].toLowerCase()),
              price: 0,
              photos: 0,
              views: 0,
              num_favorers: 0,
              long_tail: false,
              days_to_ship: 0,
            }
            popular_tags_map.set(keys[j].toLowerCase(), tag_properties);
            // console.log(key.toLowerCase())
            popular_tags_calls.push(tagListing(keys[j].toLowerCase(), api_keys[j % 3]).then(response => {
              // console.log(` hello ${JSON.stringify(response)}`)
              if (response.status == 200) {
                // console.log(response)
                let tag_properties = popular_tags_map.get(keys[j].toLowerCase());
                tag_properties.price += parseFloat(response.result.average_price);
                tag_properties.photos += response.result.photos
                tag_properties.views += response.result.searches;
                tag_properties.num_favorers += parseInt(response.result.favourites);
                tag_properties.long_tail = keys[j].toLowerCase().indexOf(' ') >= 3;
                if (response.result.min_max_shipping_days != null) {
                  tag_properties.days_to_ship = response.result.min_max_shipping_days;
                }
                popular_tags_map.set(keys[j].toLowerCase(), tag_properties);
              }
            }))

            // await Promise.race(popular_tags_calls);
          }

        }
        await Promise.all(popular_tags_calls)
        response['popular_tags'] = Array.from(popular_tags_map.entries());
        response['count'] = keys.length;
      } else if (option == 2) {
        let similar_shopper_lists = [...tag_lists].reverse().filter(containSearchKeyword);
        let ending_index = start_index + 10;
        if (similar_shopper_lists.length <= start_index) {
          return response = {
            status: 500,
            error: `Invalid index provided count  ${similar_shopper_lists.length}`,
          };
        }
        if (ending_index > similar_shopper_lists.length) {
          ending_index = similar_shopper_lists.length;
        }
        for (let j = start_index; j < start_index + 10; j++) {

          if (!similar_shopper_searches_map.has(similar_shopper_lists[j].toLowerCase())) {

            let tag_properties = {
              count: mapSort1.get(similar_shopper_lists[j]),
              price: 0,
              photos: 0,
              views: 0,
              num_favorers: 0,
              long_tail: false,
              days_to_ship: 0,
            }
            similar_shopper_searches_map.set(similar_shopper_lists[j].toLowerCase(), tag_properties);

            popular_tags_calls.push(tagListing(similar_shopper_lists[j].toLowerCase(), api_keys[j % 3]).then(response => {
              // console.log(` hello ${JSON.stringify(response)}`)
              if (response.status == 200) {
                // console.log(response)
                let tag_properties = similar_shopper_searches_map.get(similar_shopper_lists[j].toLowerCase());
                tag_properties.price += parseFloat(response.result.average_price);
                tag_properties.photos += response.result.photos
                tag_properties.views += response.result.searches;
                tag_properties.num_favorers += parseInt(response.result.favourites);
                tag_properties.long_tail = similar_shopper_lists[j].toLowerCase().indexOf(' ') >= 3;
                if (response.result.min_max_shipping_days != null) {
                  tag_properties.days_to_ship = response.result.min_max_shipping_days;
                }
                similar_shopper_searches_map.set(similar_shopper_lists[j].toLowerCase(), tag_properties);

              }
            }))

            // await Promise.race(popular_tags_calls);
          }

        }

        await Promise.all(popular_tags_calls)
        response['similar_shopper_searches'] = Array.from(similar_shopper_searches_map.entries());
        response['count'] = similar_shopper_lists.length;

      } else {
        let long_tail_alternative_list = [...tag_lists].reverse().filter(longTail);
        if (long_tail_alternative_list.length <= start_index) {
          return response = {
            status: 500,
            error: `Invalid index provided count  ${long_tail_alternative_list.length}`,
          };
        }
        let ending_index = start_index + 10;
        if (ending_index > long_tail_alternative_list.length) {
          ending_index = long_tail_alternative_list.length;
        }
        for (let j = start_index; j < ending_index; j++) {

          if (!long_tail_alternatives_map.has(long_tail_alternative_list[j].toLowerCase())) {

            let tag_properties = {

              count: mapSort1.get(long_tail_alternative_list[j]),
              price: 0,
              photos: 0,
              views: 0,
              num_favorers: 0,
              long_tail: false,
              days_to_ship: 0,
            }
            long_tail_alternatives_map.set(long_tail_alternative_list[j].toLowerCase(), tag_properties);

            popular_tags_calls.push(tagListing(long_tail_alternative_list[j].toLowerCase(), api_keys[j % 3]).then(response => {
              if (response.status == 200) {
                let tag_properties = long_tail_alternatives_map.get(long_tail_alternative_list[j].toLowerCase());
                tag_properties.price += parseFloat(response.result.average_price);
                tag_properties.photos += response.result.photos
                tag_properties.views += response.result.searches;
                tag_properties.num_favorers += parseInt(response.result.favourites);
                tag_properties.long_tail = long_tail_alternative_list[j].toLowerCase().indexOf(' ') >= 3;
                if (response.result.min_max_shipping_days != null) {
                  tag_properties.days_to_ship = response.result.min_max_shipping_days;
                }
                long_tail_alternatives_map.set(long_tail_alternative_list[j].toLowerCase(), tag_properties);
              }
            }))
          }
        }
        await Promise.all(popular_tags_calls)
        response['long_tail_alternatives'] = Array.from(long_tail_alternatives_map.entries());
        response['count'] = long_tail_alternative_list.length;
      }
      // tagListing()

    }

    else {
      return response = {
        status: 500,
        error: `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`,
      };
    }

  } catch (e) {
    console.log(e)
    return response = {
      status: 500,
      error: e,
    };
  }
  console.log(response)
  return response;
}


async function tagListing(searchKeyWord, api_key) {
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

function containSearchKeyword(tag) {
  return tag.toLowerCase().includes(keyword)
}


function longTail(tag) {
  return tag.indexOf(' ') >= 3;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


module.exports = TagListing;