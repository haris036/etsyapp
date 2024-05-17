const fetch = require("node-fetch");
require('dotenv').config()
const fs = require('fs');
const Listing = require("./listing.js");
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var myHeaders = new fetch.Headers();
const api_keys = process.env.API_KEYS.split(',')

// const { MongoClient } = require("mongodb");
// const username = encodeURIComponent("harisarif103");

// const password = encodeURIComponent("Temp.123");

// const cluster = "mycluster.u9r3f1e.mongodb.net";

// let uri =

//   `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
// // authSource=${authSource}&authMechanism=${authMechanism}

// const client = new MongoClient(uri);

myHeaders.append("x-api-key", api_keys[0]);
var method = SingleListing.prototype;
function SingleListing() { }
var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
method.getSingleListing = async function (string) {
    var items = [];
    console.log(api_keys)
    console.log(string)
    let listing_id;
    if (!isNaN(string)){
        listing_id = string;
    } else {
        let urlString = new URL(string);
        listing_id = urlString.pathname.split('/')[2];
        if(isNaN(listing_id)) {
            listing_id = urlString.pathname.split('/')[3];
        } else {
            let response = {
                status: 400,
                msg: "Invalid Url",
            };
            // console.log(shipping_day_prices);
            return response;
        }
    }
    console.log(listing_id)
    var listings = new Listing();
    const url = (
        'https://openapi.etsy.com/v3/application/listings/' + listing_id + '?' +
        new URLSearchParams({
            api_key: api_key_info.api_key,
            includes: 'images,shipping,user',
        }).toString()

    );



    let _response = await fetch(url, requestOptions);
        
    // console.log(result);
    var tags_call = [];
    var tags_data = [];
    if (_response.status == 200) {
        let result = await _response.json();
        let categories_map = !is_single_listing?await get_categories():null;
        var current_time = Date.now();
        current_time = Math.round(current_time / 1000);
        var shipping_infos = [];
        var images = [];
        // let total_images = result.Images.length;
        for (let _image of result.images) {
            let image = {
                // listing_image_id: image.listing_image_id,
                url_75x75: _image.url_75x75,
                url_170x135: _image.url_170x135,
                url_570xN: _image.url_570xN,
                url_fullxfull: _image.url_fullxfull,
            };
            images.push(
                image
            );
        }

        

        for (let shipping_profile_destinations of result.shipping_profile.shipping_profile_destinations) {
            let shipping_info = {
                currency_code: shipping_profile_destinations.primary_cost.currency_code,
                shipping_cost: shipping_profile_destinations.primary_cost.amount/ shipping_profile_destinations.primary_cost.divisor,
                origin_country_name: shipping_profile_destinations.origin_country_iso,
                applicable_destinationas: shipping_profile_destinations.destination_country_iso,
                min_delivery_days: shipping_profile_destinations.min_delivery_days,
                max_delivery_days: shipping_profile_destinations.max_delivery_days,
            }
            
            shipping_infos.push(shipping_info);
        }
        let is_single_listing = true;
        let count = 1;
        let api_index = 0;
        for (let j = 0; j < result.tags.length; j++) {
            if (count%10 == 0){
                api_index=api_index+1;
            }
            console.log(result.tags[j])
            tags_call.push( listings.getListing( result.tags[j], null, is_single_listing, api_keys[api_index]).then(response => {
                // console.log(response)
                let  tag_properties = {
                    name: response.result.name,
                    searches: response.result.searches,
                    competition: response.result.competition,
                    is_in_title: result.title.toLowerCase().includes(result.tags[j]),
                    is_in_description: result.description.toLowerCase().includes(result.tags[j]),
                    long_tail: result.tags[j].toLowerCase().indexOf(' ') >= 3,
                    favourites: response.result.favourites,
                    average_price: response.result.average_price,
                };
                console.log(response.result.name)
                tags_data.push(tag_properties);
            }));
            count=count+1;
        }

        await Promise.all(tags_call);
        // console.log("Hello")
        let item = {
            listing_id: result.listing_id,
            title: result.title,
            description: result.description,
            state: result.state,
            title_characters: result.title.length,
            descripiton_characters: result.description.length,
            words_in_title: result.title.split(" ").length,
            quantity: result.quantity,
            tags_data: tags_data,
            url: result.url,
            num_favorers: result.num_favorers,
            tags: result.tags,
            materials: result.materials,
            category: categories_map.get(result.taxonomy_id),
            price: result.price,
            views: result.views,
            creation_time: result.original_creation_timestamp,
            images: images,
            shipping_infos: shipping_infos,
            age: (current_time - result.original_creation_timestamp) / 84600,
            monthly_views: result.views / ((current_time - result.original_creation_timestamp) / 2592000),
            last_modified: result.last_modified_tsz,
            expires_on: result.ending_tsz,
            user_profile_image: result.user.image_url_75x75,
        };




        

        let response = {
            status: 200,
           item_data: item,
        };
        // console.log(shipping_day_prices);
        return response;



    } else {
        let response = {
            status: 400,
           error_msg: `Error in getting results received respose code: ${_response.status} response description: ${_response.statusText}`,
        };
        // console.log(shipping_day_prices);
        return response;
    }
}

async function get_categories() {
    var myHeaders = new fetch.Headers();
  
  
    myHeaders.append("x-api-key", api_keys[1]);
    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };
    const url = (
      'https://openapi.etsy.com/v3/application/seller-taxonomy/nodes'
  
    );
    let category_map = new Map();
    let response = await fetch(url, requestOptions);
    // console.log(response.result)
    let results = await response.json();
    // console.log(results.results)
    for (let result of results.results) {
      category_map.set(result.id, result.name);
      if (result.children && result.children.length != 0)
        getChildren(category_map, result)
  
    }
    return category_map;
  }

  function getChildren(category, result) {

    for (let child of result.children) {
      category.set(child.id, child.name);
      if (child.children && child.children.length != 0) {
        // console.log(result.id)
        getChildren(category, child)
      }
    }
  }

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
module.exports = SingleListing;
