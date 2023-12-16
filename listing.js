require('dotenv').config()
const fetch = require("node-fetch");
const fs = require('fs');
const History = require("./history.js");
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
const { MongoClient } = require("mongodb");
const { count } = require("console");
const TagListing = require("./tags_listing.js");
const username = encodeURIComponent("harisarif103");
const api_keys = process.env.API_KEYS.split(',')
const password = encodeURIComponent("Temp.123");

const cluster = "mycluster.u9r3f1e.mongodb.net";

let uri =
  `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;


const client = new MongoClient(uri);
var method = Listing.prototype;
function Listing() { }

var searchkey;
method.getListing = async function (searchKeyWord, email, is_single_listing, api_key) {
  var myHeaders = new fetch.Headers();

  if (!is_single_listing) {
    myHeaders.append("x-api-key", api_keys[0]);
  } else {
    myHeaders.append("x-api-key", api_key);
  }

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
  var items = [];
  var trends = [];

  searchkey = searchKeyWord;

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

  console.log(is_single_listing)
  try {
    var history = new History();
    var historical_metrices;

    var searches = 0;
    var favourites = 0;
    var average_price = 0.0;
    let count_of_timelines = 0;
    let sum_of_time_lines = 0;
    let date_of_timelines = "";
    let trend;
    let long_tail_alternative_list = [];
    let images_array = [];
    let history_call = !is_single_listing ? (history.getHistoricalMetrices(searchKeyWord).then(response => {
      console.log(response)

      for (let i = 0; i < response.stats.timelineData.length; i++) {
        let date = new Date(response.stats.timelineData[i].time * 1000.0);
        let month = date.getMonth() + 1;

        let temp_date_of_timelines = "" + month + "-" + date.getFullYear();
        if (i == 0) {
          date_of_timelines = temp_date_of_timelines;
          trend = {
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            value: 0,
          }
        } else if (i == response.stats.timelineData.length - 1) {
          trend.value = response.stats.timelineData[i].value[0];
          // console.log(trend)
          trends.push(trend)
        } else if (date_of_timelines != temp_date_of_timelines) {
          // console.log(trend)
          trend.value = response.stats.timelineData[i].value[0];
          trends.push(trend)
          trend = {
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            value: 0,
          }
          date_of_timelines = temp_date_of_timelines;
          sum_of_time_lines = 0;
          count_of_timelines = 0;
        }
        if (date_of_timelines == temp_date_of_timelines) {
          sum_of_time_lines += sum_of_time_lines;
          count_of_timelines += 1;
        }

      }
      historical_metrices = {
        trends: trends,
      }

    })) : null;

    let response = await fetch(urlGetActiveListings, requestOptions);
    let results = await response.json();
    let long_tail_keyword = searchKeyWord.indexOf(' ') >= 3;
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

      // let popular_tags_array = [];
      let popular_tags_calls = [];
      var similar_shopper_lists = [];
      let popular_tags_map = new Map();
      let shipping_prices_map = new Map();
      let shipping_days_map = new Map();
      let tag_list_map = new Map();
      let shipping_day_prices = {
        minimum_price: null,
        average_price: null,
        maximum_price: null,
        minimum_days: null,
        average_days: null,
        maximum_days: null,
      }
      let tag_lists = [];
      let tag_calls;
      var shipping_days_count = 0;
      var shipping_prices_count = 0;
      var sum_of_days = 0;
      var sum_of_prices = 0.0;
      var long_tail_alternatives_map = new Map();
      let views_lists = [];
      let min_max_shipping_days_lists = [];
      let item_pricing = new Map();
      var current_time = Date.now();
      var material_wise_items_map = new Map();
      var similar_shopper_searches_map = new Map();
      current_time = Math.round(current_time / 1000);
      var length = results.results.length;
      let _items = results.results;
      var _count = 0;
      console.log(length);

      for (let _item of _items) {
        _count += 1;
        var images = [];
        let image_flag = false;
        for (let _image of _item.images) {
          let image = {
            listing_image_id: _image.listing_image_id,
            url_75x75: _image.url_75x75,
            url_170x135: _image.url_170x135,
            url_570xN: _image.url_570xN,
            url_fullxfull: _image.url_fullxfull,
          };
          if (!image_flag) {
            images_array.push(_image.url_fullxfull);
            image_flag = true;
          }
          images.push(
            image
          );
        }


        let max_shipping_item_day = null;
        let min_shipping_item_day = null;
        let shipping_day_set = false;
        let shipping_price_set = false;
        for (let shipping_profile_destinations of _item.shipping_profile.shipping_profile_destinations) {
          let primary_amount = (parseFloat(shipping_profile_destinations.primary_cost.amount) / parseFloat(shipping_profile_destinations.primary_cost.divisor));
          if (primary_amount != null) {
            if (shipping_day_prices.maximum_price == null || primary_amount > shipping_day_prices.maximum_price) {
              shipping_day_prices.maximum_price = primary_amount;
            } else if (shipping_day_prices.minimum_price == null || primary_amount < shipping_day_prices.minimum_price) {
              shipping_day_prices.minimum_price = primary_amount;
            }

            shipping_prices_count += 1;
            sum_of_prices += parseFloat(primary_amount);
            if (!shipping_prices_map.has(primary_amount)) {
              shipping_prices_map.set(primary_amount, 0);
            }
            let shipping_price_count_map = shipping_prices_map.get(primary_amount);
            shipping_price_count_map += 1;
            shipping_prices_map.set(primary_amount, shipping_price_count_map);
            shipping_price_set = true;
          }
          if (shipping_profile_destinations.min_delivery_days != null && shipping_profile_destinations.max_delivery_days != null) {
            if (!shipping_days_map.has(shipping_profile_destinations.min_delivery_days)) {
              shipping_days_map.set(shipping_profile_destinations.min_delivery_days, 0);
            }
            if (shipping_day_prices.minimum_days == null || shipping_day_prices.minimum_days > shipping_profile_destinations.min_delivery_days) {
              shipping_day_prices.minimum_days = shipping_profile_destinations.min_delivery_days;
            }

            if (min_shipping_item_day == null || min_shipping_item_day > shipping_profile_destinations.min_delivery_days) {
              min_shipping_item_day = shipping_profile_destinations.min_delivery_days;
            }
            shipping_days_count += 1;
            let min_shipping_day = shipping_days_map.get(shipping_profile_destinations.min_delivery_days);
            min_shipping_day += 1;

            shipping_days_map.set(shipping_profile_destinations.min_delivery_days, min_shipping_day);
            sum_of_days += shipping_profile_destinations.min_delivery_days;

            if (!shipping_days_map.has(shipping_profile_destinations.max_delivery_days)) {
              shipping_days_map.set(shipping_profile_destinations.max_delivery_days, 0);
            }

            let max_shipping_day = shipping_days_map.get(shipping_profile_destinations.max_delivery_days);
            if (shipping_day_prices.maximum_days == null || shipping_day_prices.maximum_days < shipping_profile_destinations.max_delivery_days) {
              shipping_day_prices.maximum_days = shipping_profile_destinations.max_delivery_days;
            }

            if (max_shipping_item_day == null || max_shipping_item_day < shipping_profile_destinations.max_delivery_days) {
              max_shipping_item_day = shipping_profile_destinations.max_delivery_days;
            }
            max_shipping_day += 1;
            shipping_days_map.set(shipping_profile_destinations.max_delivery_days, max_shipping_day);
            sum_of_days += shipping_profile_destinations.max_delivery_days;
            shipping_day_set = true;
          }
        }
        if (!shipping_day_set) {
          if(!shipping_days_map.has(-1)) {
            shipping_days_map.set(-1, 0)
          }
          let undeclared_shipping_day = shipping_days_map.get(-1);
          shipping_days_map.set(-1, undeclared_shipping_day + 1)
        }

        if (!shipping_price_set) {
          if(!shipping_prices_map.has(-1)) {
            shipping_prices_map.set(-1, 0)
          }
          let undeclared_shipping_price = shipping_prices_map.get(-1);
          shipping_prices_map.set(-1, undeclared_shipping_price + 1)
        }

        let item = {
          listing_id: _item.listing_id,
          title: _item.title,
          user_id: _item.user_id,
          description: _item.description,
          state: _item.state,
          quantity: _item.quantity,
          featured_rank: _item.featured_rank,
          url: _item.url,
          num_favorers: _item.num_favorers,
          tags: _item.tags,
          materials: _item.materials,
          price: _item.price.amount / _item.price.divisor,
          images: images,
          views: _item.views,
          creation_time: _item.original_creation_timestamp,
          category: _item.taxonomy_path,
          min_max_shipping_days: "",
        };
        for (let tag of item.tags) {
          if (!tag_list_map.has(tag.toLowerCase())) {
            // console.log(tag.toLowerCase())
            tag_list_map.set(tag.toLowerCase(), 0)
            tag_lists.push(tag.toLowerCase());
          }
          tag_list_map.set(tag.toLowerCase(), tag_list_map.get(tag.toLowerCase()) + 1);

        }
        // console.log(tag_list_map)

        if (min_shipping_item_day != null) {
          item.min_max_shipping_days = min_shipping_item_day + "";
        }

        if (max_shipping_item_day != null) {

          if (item.min_max_shipping_days != null) {
            item.min_max_shipping_days = item.min_max_shipping_days + "-";
          }
          item.min_max_shipping_days = item.min_max_shipping_days + max_shipping_item_day;
        }
        if (!is_single_listing) {
          for (let i = 0; i < item.materials.length; i++) {
            if (!material_wise_items_map.has(item.materials[i].toLowerCase())) {
              material_wise_items_map.set(item.materials[i].toLowerCase(), material_item = {
                count: 0,
                minimum_price: null,
                average_price: 0.0,
                maximum_price: null,
                sum_of_prices: 0.0,
              });

            }
            material_item = material_wise_items_map.get(item.materials[i].toLowerCase());
            material_item.count += 1;
            views_lists.push(item.views);

            if (material_item.minimum_price == null || material_item.minimum_price > parseFloat(item.price)) {
              material_item.minimum_price = parseFloat(item.price);
            }
            if (material_item.maximum_price == null || material_item.maximum_price < parseFloat(item.price)) {
              material_item.maximum_price = parseFloat(item.price);
            }
            material_item.sum_of_prices += parseFloat(item.price);
          }
        }



        // let counter = 0;



        favourites += parseInt(item.num_favorers);
        searches += item.views;

        average_price += parseFloat(item.price);
        if (!item_pricing.has(item.price)) {
          item_pricing.set(item.price, 0);
        }

        let count = item_pricing.get(item.price);
        item_pricing.set(item.price, ++count);
        items.push(
          item,
        );
        min_max_shipping_days_lists.push(item.min_max_shipping_days);
      }
      // let counter = 0;
      let shipping_prices_pie_chart_map = createPricesPieChartMap(shipping_prices_map, shipping_prices_count,);

      let shipping_day_pie_chart_map = createDayPieChartMap(shipping_days_map, shipping_days_count,);

      let mapSort1 = new Map([...tag_list_map.entries()].sort((a, b) => b[1] - a[1]));
      // console.log(mapSort1)
      similar_shopper_lists = [...tag_lists].reverse().filter(containSearchKeyword);
      long_tail_alternative_list = [...tag_lists].reverse().filter(longTail);
      if (!is_single_listing)
        await tagCalls(similar_shopper_lists, long_tail_alternative_list, popular_tags_calls, popular_tags_map, long_tail_alternatives_map, similar_shopper_searches_map, mapSort1);
      shipping_day_prices.average_price = sum_of_prices / shipping_prices_count;
      shipping_day_prices.average_days = sum_of_days / shipping_days_count;
      if (!is_single_listing) {
        await Promise.resolve(history_call);
      }
      // console.log(popular_tags_map)
      let popular_tags = Array.from(popular_tags_map.entries());
      console.log(mapSort1)
      const popular_tags_list_map = Object.fromEntries(mapSort1);
      // const popular_tags_list_map = JSON.stringify(obj);

      // let popular_tags_list_map = Array.from(mapSort1.entries());
      let shipping_days = Array.from(shipping_days_map.entries());
      let shipping_prices = Array.from(shipping_prices_map.entries());
      let long_tail_alternatives = Array.from(long_tail_alternatives_map.entries());
      let material_items = Array.from(material_wise_items_map);
      let similar_shopper_searches = Array.from(similar_shopper_searches_map.entries());
      let shipping_day_pie_chart_data = Array.from(shipping_day_pie_chart_map.entries());
      console.log(shipping_day_pie_chart_data)
      console.log(shipping_prices_pie_chart_map)
      let shipping_prices_pie_chart_data = Array.from(shipping_prices_pie_chart_map.entries());
      let result = {
        status: 200,
        name: searchKeyWord,
        items: items,
        popular_tags: popular_tags,
        item_pricing: Array.from(item_pricing.entries()),
        historical_metrices: historical_metrices,
        long_tail_keyword: long_tail_keyword,
        competition: competition,
        shipping_day_prices: shipping_day_prices,
        shipping_prices: shipping_prices,
        shipping_days: shipping_days,
        long_tail_alternatives: long_tail_alternatives,
        material_items: material_items,
        avg_searches: searches / length,
        searches: searches,
        favourites: favourites,
        average_price: average_price / length,
        similar_shopper_searches: similar_shopper_searches,
        shipping_day_pie_chart_data: shipping_day_pie_chart_data,
        shipping_prices_pie_chart_data: shipping_prices_pie_chart_data,
        popular_tags_list_map: popular_tags_list_map,
        similar_shopper_lists: similar_shopper_lists,
        long_tail_alternative_list: long_tail_alternative_list,
        images: images_array,
      };

      if (!is_single_listing) {
        await client.connect();

        const database = client.db("etsy_database");

        const doc = {
          email: email.user,
          keyword: searchKeyWord,
          searches: result.searches,
          competition: result.competition,
          average_price: result.average_price,
          search_time: Date.now(),
        };
        const history = database.collection("user_history");

        await history.insertOne(doc);
      }
      let response = {
        status: 200,
        result: result,
      }
      // console.log(shipping_day_prices);
      return response;
    }

    else {
      let _response = {
        status: 500,
        error_msg: `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`,
      }
      return _response;
    }

  } catch (e) {
    console.log(e)
    let _response = {
      status: 500,
      error_msg: e,
    }
    return _response;
  } finally {
    if (!is_single_listing) {
      await client.close();
    }
  }
};

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

async function tagCalls(similar_shopper_lists, long_tail_alternative_list, popular_tags_calls, popular_tags_map, long_tail_alternatives_map, similar_shopper_searches_map, mapSort1) {
  let _count = 0;
  var tag_listing = new TagListing;
  // console.log(mapSort1)
  for (let [key, value] of mapSort1.entries()) {
    // console.log(key.toLowerCase())
    if (!popular_tags_map.has(key.toLowerCase())) {
      let tag_properties = {
        count: value,
        price: 0,
        photos: 0,
        views: 0,
        num_favorers: 0,
        long_tail: false,
        days_to_ship: 0,
      }
      popular_tags_map.set(key.toLowerCase(), tag_properties);
      // console.log(key.toLowerCase())
      popular_tags_calls.push(tag_listing.getTagListing(key.toLowerCase(), api_keys[0]).then(response => {
        // console.log(` hello ${JSON.stringify(response)}`)
        if (response.status == 200) {
          // console.log(response)
          let tag_properties = popular_tags_map.get(key.toLowerCase());
          tag_properties.price += parseFloat(response.result.average_price);
          tag_properties.photos += response.result.photos
          tag_properties.views += response.result.searches;
          tag_properties.num_favorers += parseInt(response.result.favourites);
          tag_properties.long_tail = key.toLowerCase().indexOf(' ') >= 3;
          if (response.result.min_max_shipping_days != null) {
            tag_properties.days_to_ship = response.result.min_max_shipping_days;
          }
          popular_tags_map.set(key.toLowerCase(), tag_properties);
        }
      }))

      // await Promise.race(popular_tags_calls);
    }
    _count = _count + 1;
    // console.log(_count)
    if (_count == 10) {
      break;
    }
  }

  // console.log(similar_shopper_lists)
  for (let j = 0; j < 10; j++) {

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

      popular_tags_calls.push(tag_listing.getTagListing(similar_shopper_lists[j].toLowerCase(), api_keys[1]).then(response => {
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
  // console.log(long_tail_alternative_list)
  for (let j = 0; j < 10; j++) {

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

      popular_tags_calls.push(tag_listing.getTagListing(long_tail_alternative_list[j].toLowerCase(), api_keys[2]).then(response => {
        // console.log(` hello ${JSON.stringify(response)}`)
        if (response.status == 200) {
          // console.log(response)
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

      // await Promise.race(popular_tags_calls);
    }
  }
  await Promise.all(popular_tags_calls);
  // console.log(popular_tags_calls)
}
// minimum_price: null,
// average_price: null,
// maximum_price: null,
function createPricesPieChartMap(shipping_prices_map, shipping_prices_count,) {
  let _shipping_prices_pie_chart_map = new Map();
  let shipping_prices_pie_chart_map = new Map();
  for (let [key, value] of shipping_prices_map.entries()) {
    if (key > -1) {
      let remainder = key % 10;
      let to_add = 10 - remainder;
      let maximum_limit = to_add + key;
      let minimum_limit = key - remainder;
      if (!_shipping_prices_pie_chart_map.has(`${minimum_limit} - ${maximum_limit}`)) {
        _shipping_prices_pie_chart_map.set(`${minimum_limit} - ${maximum_limit}`, 0)
      }
      _shipping_prices_pie_chart_map.set(`${minimum_limit} - ${maximum_limit}`, (_shipping_prices_pie_chart_map.get(`${minimum_limit} - ${maximum_limit}`)) + value)
    } else {
      if (!_shipping_prices_pie_chart_map.has("Not mentioned")) {
        _shipping_prices_pie_chart_map.set("Not mentioned", 0)
      }
      _shipping_prices_pie_chart_map.set("Not mentioned", (_shipping_prices_pie_chart_map.get("Not mentioned")) + value)
    }
  }
  for (let [key, value] of _shipping_prices_pie_chart_map.entries()) {
    let percentage = value * 100 / shipping_prices_count;
    shipping_prices_pie_chart_map.set(key, percentage)
  }

  return shipping_prices_pie_chart_map;
}

// maximum_price: null,
function createDayPieChartMap(shipping_days_map, shipping_days_count,) {
  console.log(shipping_days_map)
  let shipping_days_pie_chart_map = new Map();
  let _shipping_days_pie_chart_map = new Map();
  for (let [key, value] of shipping_days_map.entries()) {
    if (key > -1) {
      let remainder = key % 10;
      let to_add = 10 - remainder;
      let maximum_limit = to_add + key;
      let minimum_limit = key - remainder;
      if (!_shipping_days_pie_chart_map.has(`${minimum_limit} - ${maximum_limit}`)) {
        _shipping_days_pie_chart_map.set(`${minimum_limit} - ${maximum_limit}`, 0)
      }
      _shipping_days_pie_chart_map.set(`${minimum_limit} - ${maximum_limit}`, (_shipping_days_pie_chart_map.get(`${minimum_limit} - ${maximum_limit}`)) + value)
    } else {
      if (!_shipping_days_pie_chart_map.has("Not mentioned")) {
        _shipping_days_pie_chart_map.set("Not mentioned", 0)
      }
      _shipping_days_pie_chart_map.set("Not mentioned", (_shipping_days_pie_chart_map.get("Not mentioned")) + value)
    }
  }

  for (let [key, value] of _shipping_days_pie_chart_map.entries()) {
    let percentage = value * 100 / shipping_days_count;
    shipping_days_pie_chart_map.set(key, percentage)
  }
  return shipping_days_pie_chart_map;
}

function containSearchKeyword(tag) {
  return tag.toLowerCase().includes(searchkey)
}


function longTail(tag) {
  return tag.indexOf(' ') >= 3;
}

module.exports = Listing;