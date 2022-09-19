const fetch = require("node-fetch");
const fs = require('fs');
const History = require("./history.js");
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var headers = new fetch.Headers();
headers.append("x-api-key", api_key_info.api_key);
var method = Listing.prototype;
function Listing() { }

method.getListing = async function (searchKeyWord) {
  var items = [];
  var trends = [];

  const url = (
    'https://openapi.etsy.com/v2/listings/active?' +
    new URLSearchParams({
      api_key: api_key_info.api_key,
      keywords: searchKeyWord,
      limit: 100,
      sort_on: "created",
      includes: 'Images,ShippingInfo,MainImage'
    }).toString()

  );
  try {
    var history = new History();
    var historical_metrices;

    var searches = 0;
    var favourites = 0;
    var average_price = 0.0;

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
    let response = await fetch(url);
    let results = await response.json();
    let long_tail_keyword = searchKeyWord.indexOf(' ') >= 3;

    if (response.status == 200) {
      var length = results.results.length;
      var competition = results.count;
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
      for (let itemIndex = 0; itemIndex < length; itemIndex++) {
        var images = [];
        // console.log(results.results[itemIndex].Images)
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

        for (let i = 0; i < results.results[itemIndex].ShippingInfo.length; i++) {
          if (shipping_day_prices.maximum_price == null || parseFloat(results.results[itemIndex].ShippingInfo[i].primary_cost) > shipping_day_prices.maximum_price) {
            shipping_day_prices.maximum_price = parseFloat(results.results[itemIndex].ShippingInfo[i].primary_cost);
          } else if (shipping_day_prices.minimum_price == null || parseFloat(results.results[itemIndex].ShippingInfo[i].primary_cost) < shipping_day_prices.minimum_price) {
            shipping_day_prices.minimum_price = parseFloat(results.results[itemIndex].ShippingInfo[i].primary_cost);
          }
          shipping_prices_count += 1;
          sum_of_prices += parseFloat(results.results[itemIndex].ShippingInfo[i].primary_cost);
          if (!shipping_prices_map.has(results.results[itemIndex].ShippingInfo[i].primary_cost)) {
            shipping_prices_map.set(results.results[itemIndex].ShippingInfo[i].primary_cost, 0);
          }
          let shipping_price_count_map = shipping_prices_map.get(results.results[itemIndex].ShippingInfo[i].primary_cost);
          shipping_price_count_map += 1;
          shipping_prices_map.set(results.results[itemIndex].ShippingInfo[i].primary_cost, shipping_price_count_map);
        }

        let item = {
          listing_id: results.results[itemIndex].listing_id,
          title: results.results[itemIndex].title,
          description: results.results[itemIndex].description,
          state: results.results[itemIndex].state,
          quantity: results.results[itemIndex].quantity,
          featured_rank: results.results[itemIndex].featured_rank,
          url: results.results[itemIndex].url,
          num_favorers: results.results[itemIndex].num_favorers,
          tags: results.results[itemIndex].tags,
          materials: results.results[itemIndex].materials,
          price: results.results[itemIndex].price,
          images: images,
          views: results.results[itemIndex].views,
          creation_time: results.results[itemIndex].original_creation_tsz,
          category: results.results[itemIndex].taxonomy_path,
        };

        for (let i = 0; i < item.materials.length; i++) {
          if (!material_wise_items_map.has(item.materials[i].toLowerCase())) {
            material_wise_items_map.set(item.materials[i].toLowerCase(), material_item = {
              category_wise_map: new Map(),
            });
          }
          material_item = material_wise_items_map.get(item.materials[i].toLowerCase());
          // material_item.count += 1;
          for (let j = 0; j < item.category.length; j++) {
            if (material_item.category_wise_map.has(item.category[j].toLowerCase)) {
              material_item.category_wise_map.set(item.category[i].toLowerCase(), material_category_item = {
                count: 0,
                minimum_price: null,
                average_price: 0.0,
                maximum_price: null,
                sum_of_prices: 0.0,
              });
              category_item = material_item.category_wise_map.get(item.category[j].toLowerCase);
              category_item.count += 1
              if (category_item.minimum_price == null || category_item.minimum_price > parseFloat(item.price)) {
                category_item.minimum_price = parseFloat(category_item.price);
              }
              if (category_item.maximum_price == null || category_item.maximum_price < parseFloat(item.price)) {
                category_item.maximum_price = parseFloat(item.price);
              }
              category_item.sum_of_prices += parseFloat(item.price);
            }
          }
          // if (material_item.minimum_price == null || material_item.minimum_price > parseFloat(item.price)) {
          //   material_item.minimum_price = parseFloat(item.price);
          // }
          // if (material_item.maximum_price == null || material_item.maximum_price < parseFloat(item.price)) {
          //   material_item.maximum_price = parseFloat(item.price);
          // }
          // material_item.sum_of_prices += parseFloat(item.price);
        }

        if (results.results[itemIndex].processing_min != null) {
          if (!shipping_days_map.has(results.results[itemIndex].processing_min)) {
            shipping_days_map.set(results.results[itemIndex].processing_min, 0);
          }
          if (shipping_day_prices.minimum_days == null || shipping_day_prices.minimum_days > results.results[itemIndex].processing_min) {
            shipping_day_prices.minimum_days = results.results[itemIndex].processing_min;
          }
          shipping_days_count += 1;
          let min_shipping_day = shipping_days_map.get(results.results[itemIndex].processing_min);
          min_shipping_day += 1;

          shipping_days_map.set(results.results[itemIndex].processing_min, min_shipping_day);
          sum_of_days += results.results[itemIndex].processing_min;
        }

        if (results.results[itemIndex].processing_max != null) {
          if (!shipping_days_map.has(results.results[itemIndex].processing_max)) {
            shipping_days_map.set(results.results[itemIndex].processing_max, 0);
          }

          let max_shipping_day = shipping_days_map.get(results.results[itemIndex].processing_max);
          if (shipping_day_prices.maximum_days == null || shipping_day_prices.maximum_days < results.results[itemIndex].processing_max) {
            shipping_day_prices.maximum_days = results.results[itemIndex].processing_max;
          }
          max_shipping_day += 1;
          shipping_days_map.set(results.results[itemIndex].processing_max, max_shipping_day);
          sum_of_days += results.results[itemIndex].processing_max;
        }

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
          tag_properties.days_to_ship = (results.results[itemIndex].processing_min == null ? 0 : results.results[itemIndex].processing_min + results.results[itemIndex].processing_max == null ? 0 : results.results[itemIndex].processing_max) / 2;
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
      console.log(material_wise_items_map);
      let material_items = toObject(material_wise_items_map);
      let similar_shopper_searches = Array.from(similar_shopper_searches_map.entries());
      let result = {
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


      // console.log(shipping_day_prices);
      return result;
    }

    else {
      return `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`;
    }
  } catch (e) {
    console.log("Exception in calling getListing", e);
  }
};

const toObject = (map = new Map) =>
  Array.from
    ( map.entries()
    , ([ k, v ]) =>
        v instanceof Map
          ? { key: k, value: toObject (v) }
          : { key: k, value: v }
    )

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
module.exports = Listing;
