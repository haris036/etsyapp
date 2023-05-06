const fetch = require("node-fetch");
const fs = require('fs');
const Listing = require("./listing.js");
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var myHeaders = new fetch.Headers();
myHeaders.append("x-api-key", "7vudmbql4ympd8mrzsajli9n");
var method = SingleListing.prototype;
function SingleListing() { }
var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };
method.getSingleListing = async function (listing_id) {
    var items = [];

    var listings = new Listing();
    const url = (
        'https://openapi.etsy.com/v3/application/listings/' + listing_id + '?' +
        new URLSearchParams({
            api_key: api_key_info.api_key,
            includes: 'images,shipping',
        }).toString()

    );



    response = await fetch(url, requestOptions);
    let result = await response.json();
    // console.log(result);
    var tags_call = [];
    var tags_data = [];
    if (response.status == 200) {
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

        for (let j = 0; j < result.tags.length; j++) {
            // sleep(300);
            tags_call.push( listings.getListing( result.tags[j]).then(response => {
                // console.log(response);
                let  tag_properties = {
                    name: result.tags[j],
                    searches: response.searches,
                    competition: response.competition,
                    is_in_title: result.title.toLowerCase().includes(result.tags[j]),
                    is_in_description: result.description.toLowerCase().includes(result.tags[j]),
                    long_tail: result.tags[j].toLowerCase().indexOf(' ') >= 2,
                    favourites: response.favourites,
                    average_price: response.average_price,
                };
                
                tags_data.push(tag_properties);

            }));
            // if (j % 9 == 0){
            //     await Promise.all(tags_call);
            //     tags_call.splice(0, tags_call.length);
            // }
        }

        await Promise.all(tags_call);
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
            category: result.taxonomy_path,
            price: result.price,
            views: result.views,
            creation_time: result.original_creation_timestamp,
            images: images,
            shipping_infos: shipping_infos,
            age: (current_time - result.original_creation_timestamp) / 84600,
            monthly_views: result.views / ((current_time - result.original_creation_timestamp) / 2592000),
            last_modified: result.last_modified_tsz,
            expires_on: result.ending_tsz,
        };




        

        let response = {
           item_data: item,
        };
        // console.log(shipping_day_prices);
        return response;



    } else {
        return `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`;
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
module.exports = SingleListing;