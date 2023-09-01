const fetch = require("node-fetch");
const fs = require('fs');
const History = require("./history.js");
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
const { MongoClient } = require("mongodb");
const { count } = require("console");
const username = encodeURIComponent("harisarif103");

const password = encodeURIComponent("Temp.123");

const cluster = "mycluster.u9r3f1e.mongodb.net";

let uri =

  `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
// authSource=${authSource}&authMechanism=${authMechanism}

const client = new MongoClient(uri);
var method = Listing.prototype;
function Listing() { }
var myHeaders = new fetch.Headers();
myHeaders.append("x-api-key", "7vudmbql4ympd8mrzsajli9n");
var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

method.getListing = async function (searchKeyWord, email, is_single_listing) {
  var items = [];
  var trends = [];



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
    let history_call = history.getHistoricalMetrices(searchKeyWord).then(response => {
      for (let i = 0; i < response.timelineData.length; i++) {
        let date = new Date(response.timelineData[i].time * 1000.0);
        let month =  date.getMonth() + 1;

        let temp_date_of_timelines = "" + month + "-" + date.getFullYear();
        if (i == 0) {
          date_of_timelines = temp_date_of_timelines;
          trend = {
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            value: 0,
          }
        } else if (i == response.timelineData.length - 1){
          trend.value = response.timelineData[i].value[0];
          // console.log(trend)
          trends.push(trend)
        } else if (date_of_timelines != temp_date_of_timelines) {
          // console.log(trend)
          trend.value = response.timelineData[i].value[0];
          trends.push(trend)
          trend = {
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            value: 0,
          }
          date_of_timelines = temp_date_of_timelines;
          sum_of_time_lines=0;
          count_of_timelines=0;
        }
        if (date_of_timelines == temp_date_of_timelines) {
          sum_of_time_lines+=sum_of_time_lines;
          count_of_timelines+=1;
        }
        
      }
      historical_metrices = {
        trends: trends,
      }

    });
    
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


      let popular_tags_map = new Map();
      let shipping_prices_map = new Map();
      let shipping_days_map = new Map();
      let shipping_day_prices = {
        minimum_price: null,
        average_price: null,
        maximum_price: null,
        minimum_days: null,
        average_days: null,
        maximum_days: null,
      }
      var shipping_days_count = 0;
      var shipping_prices_count = 0;
      var sum_of_days = 0;
      var sum_of_prices = 0.0;
      var long_tail_alternatives_map = new Map();
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
        // console.log(_count);
        // console.log(items.length)
        var images = [];
        // console.log(results.results[itemIndex])
        // console.log(results.results[itemIndex].Images)
        // let total_images = _item.images.length;
        // console.log(_item)
        for (let _image of _item.images) {
          let image = {
            listing_image_id: _image.listing_image_id,
            url_75x75: _image.url_75x75,
            url_170x135: _image.url_170x135,
            url_570xN: _image.url_570xN,
            url_fullxfull: _image.url_fullxfull,
          };
          images.push(
            image
          );
        }
        // console.log(results.results[itemIndex].shipping_profile_destinations)
        let max_shipping_item_day = null;
        let min_shipping_item_day = null;
        // console.log(_item.shipping_profile);

        // let item_shipping_days_count = 0;
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
          }
          if (shipping_profile_destinations.min_delivery_days != null && shipping_profile_destinations.max_delivery_days != null) {
            // avg_days_to_ship += (shipping_profile_destinations.min_delivery_days == null ? 0 : shipping_profile_destinations.min_delivery_days + shipping_profile_destinations.max_delivery_days == null ? 0 : shipping_profile_destinations.max_delivery_days) / 2;
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
            // item_shipping_days_count += 1;
          }
        }
        // console.log("avg_days_to_ship: " + avg_days_to_ship);
        // console.log("shipping_prices_count: " + shipping_prices_count)
        // if (avg_days_to_ship != 0) {
        //   console.log(avg_days_to_ship+ " "+ shipping_days_count )
        // }
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
        if (min_shipping_item_day != null) {
          item.min_max_shipping_days = min_shipping_item_day + "";
        }

        if (max_shipping_item_day != null) {

          if (item.min_max_shipping_days != null) {
            item.min_max_shipping_days = item.min_max_shipping_days + "-";
          }
          item.min_max_shipping_days = item.min_max_shipping_days + max_shipping_item_day;
        }

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
          if (material_item.minimum_price == null || material_item.minimum_price > parseFloat(item.price)) {
            material_item.minimum_price = parseFloat(item.price);
          }
          if (material_item.maximum_price == null || material_item.maximum_price < parseFloat(item.price)) {
            material_item.maximum_price = parseFloat(item.price);
          }
          material_item.sum_of_prices += parseFloat(item.price);
        }

        // if (results.results[itemIndex].processing_min != null) {
        //   if (!shipping_days_map.has(results.results[itemIndex].processing_min)) {
        //     shipping_days_map.set(results.results[itemIndex].processing_min, 0);
        //   }
        //   if (shipping_day_prices.minimum_days == null || shipping_day_prices.minimum_days > results.results[itemIndex].processing_min) {
        //     shipping_day_prices.minimum_days = results.results[itemIndex].processing_min;
        //   }
        //   shipping_days_count += 1;
        //   let min_shipping_day = shipping_days_map.get(results.results[itemIndex].processing_min);
        //   min_shipping_day += 1;

        //   shipping_days_map.set(results.results[itemIndex].processing_min, min_shipping_day);
        //   sum_of_days += results.results[itemIndex].processing_min;
        // }

        // if (results.results[itemIndex].processing_max != null) {
        //   if (!shipping_days_map.has(results.results[itemIndex].processing_max)) {
        //     shipping_days_map.set(results.results[itemIndex].processing_max, 0);
        //   }

        //   let max_shipping_day = shipping_days_map.get(results.results[itemIndex].processing_max);
        //   if (shipping_day_prices.maximum_days == null || shipping_day_prices.maximum_days < results.results[itemIndex].processing_max) {
        //     shipping_day_prices.maximum_days = results.results[itemIndex].processing_max;
        //   }
        //   max_shipping_day += 1;
        //   shipping_days_map.set(results.results[itemIndex].processing_max, max_shipping_day);
        //   sum_of_days += results.results[itemIndex].processing_max;
        // }

        for (let j = 0; j < item.tags.length; j++) {
          if (!popular_tags_map.has(item.tags[j].toLowerCase())) {
            let tag_properties = {
              count: 0,
              photos: 0,
              price: 0.0,
              views: 0,
              num_favorers: 0,
              long_tail: false,
              days_to_ship: 0,
            }
            popular_tags_map.set(item.tags[j].toLowerCase(), tag_properties);
          }
          average_price += parseFloat(item.price);
          let tag_properties = popular_tags_map.get(item.tags[j].toLowerCase());
          tag_properties.count++;
          tag_properties.price += parseFloat(item.price);
          tag_properties.photos += images.length
          tag_properties.views += item.views;
          tag_properties.num_favorers += parseInt(item.num_favorers);
          favourites += parseInt(item.num_favorers);
          tag_properties.long_tail = item.tags[j].toLowerCase().indexOf(' ') >= 2;
          if (item.min_max_shipping_days != null) {
            tag_properties.days_to_ship = item.min_max_shipping_days;
          }
          popular_tags_map.set(item.tags[j].toLowerCase(), tag_properties);
          if (tag_properties.long_tail && item.tags[j].toLowerCase().includes(searchKeyWord.toLowerCase())) {
            long_tail_alternatives_map.set(item.tags[j].toLowerCase(), tag_properties);
          }
          if (item.tags[j].toLowerCase().includes(searchKeyWord.toLowerCase())) {
            similar_shopper_searches_map.set(item.tags[j].toLowerCase(), tag_properties)
          }
        }

        searches += item.views;


        if (!item_pricing.has(item.price)) {
          item_pricing.set(item.price, 0);
        }

        let count = item_pricing.get(item.price);
        item_pricing.set(item.price, ++count);
        items.push(
          item,
        );
      }
      shipping_day_prices.average_price = sum_of_prices / shipping_prices_count;
      shipping_day_prices.average_days = sum_of_days / shipping_days_count;
      await Promise.resolve(history_call);
      let popular_tags = Array.from(popular_tags_map.entries());
      let shipping_days = Array.from(shipping_days_map.entries());
      let shipping_prices = Array.from(shipping_prices_map.entries());
      let long_tail_alternatives = Array.from(long_tail_alternatives_map.entries());
      // let material_items = new Map()
      // console.log(material_wise_items_map);
      console.log(historical_metrices);
      let material_items = Array.from(material_wise_items_map);
      let similar_shopper_searches = Array.from(similar_shopper_searches_map.entries());
      let result = {
        status: 200,
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

        const _response = await history.insertOne(doc);
      }
      let response = {
        status: 200,
        result: result,
      }
      // console.log(shipping_day_prices);
      return response;
    }

    else {
      let response = {
        status: 500,
        error_msg: `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`,
      }
      return response;
    }

  } catch (e) {

    let response = {
      status: 500,
      error_msg: e,
    }
    return response;
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
module.exports = Listing;
