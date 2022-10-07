const fetch = require("node-fetch");
const fs = require('fs');
const Listing = require("./listing.js");
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var headers = new fetch.Headers();
headers.append("x-api-key", api_key_info.api_key);
var method = SingleListing.prototype;
function SingleListing() { }

method.getSingleListing = async function (listing_id) {
    var items = [];

    var listings = new Listing();
    const url = (
        'https://openapi.etsy.com/v2/listings/' + listing_id + '?' +
        new URLSearchParams({
            api_key: api_key_info.api_key,
            includes: 'Images,ShippingInfo,MainImage',
        }).toString()

    );



    let response = await fetch(url);
    let results = await response.json();
    var tags_call = [];
    var tags_data = [];
    if (response.status == 200) {
        var current_time = Date.now();
        current_time = Math.round(current_time / 1000);
        var shipping_infos = [];
        var images = [];
        let total_images = results.results[0].Images.length;
        for (let i = 0; i < total_images; i++) {
            let image = {
                listing_image_id: results.results[0].Images[i].listing_image_id,
                url_75x75: results.results[0].Images[i].url_75x75,
                url_170x135: results.results[0].Images[i].url_170x135,
                url_570xN: results.results[0].Images[i].url_570xN,
                url_fullxfull: results.results[0].Images[i].url_fullxfull,
            };
            images.push(
                image
            );
        }

        for (let i = 0; i < results.results[0].ShippingInfo.length; i++) {
            let shipping_info = {
                currency_code: results.results[0].ShippingInfo[i].currency_code,
                shipping_cost: results.results[0].ShippingInfo[i].primary_cost,
                origin_country_name: results.results[0].ShippingInfo[i].origin_country_name,
                applicable_destinationas: results.results[0].ShippingInfo[i].destination_country_name,
                min_delivery_time: results.results[0].processing_min,
                max_delivery_time: results.results[0].processing_max,
            }
            
            shipping_infos.push(shipping_info);
        }

        for (let j = 0; j < results.results[0].tags.length; j++) {

            tags_call.push( listings.getListing( results.results[0].tags[j]).then(response => {
                // console.log(response);
                let  tag_properties = {
                    name: results.results[0].tags[j],
                    searches: response.searches,
                    competition: response.competition,
                    is_in_title: results.results[0].title.toLowerCase().includes(results.results[0].tags[j]),
                    is_in_description: results.results[0].description.toLowerCase().includes(results.results[0].tags[j]),
                    long_tail: results.results[0].tags[j].toLowerCase().indexOf(' ') >= 2,
                    favourites: response.favourites,
                    average_price: response.average_price,
                };
                
                tags_data.push(tag_properties);

            }));
            if (j % 9 == 0){
                await Promise.all(tags_call);
                tags_call.splice(0, tags_call.length);
            }
        }

        
        let item = {
            listing_id: results.results[0].listing_id,
            title: results.results[0].title,
            description: results.results[0].description,
            state: results.results[0].state,
            title_characters: results.results[0].title.length,
            descripiton_characters: results.results[0].description.length,
            words_in_title: results.results[0].title.split(" ").length,
            quantity: results.results[0].quantity,
            tags_data: tags_data,
            url: results.results[0].url,
            num_favorers: results.results[0].num_favorers,
            tags: results.results[0].tags,
            materials: results.results[0].materials,
            category: results.results[0].taxonomy_path,
            price: results.results[0].price,
            views: results.results[0].views,
            creation_time: results.results[0].original_creation_tsz,
            images: images,
            shipping_infos: shipping_infos,
            age: (current_time - results.results[0].original_creation_tsz) / 84600,
            monthly_views: results.results[0].views / ((current_time - results.results[0].original_creation_tsz) / 2592000),
            last_modified: results.results[0].last_modified_tsz,
            expires_on: results.results[0].ending_tsz,
        };




        

        let result = {
           item_data: item,
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
module.exports = SingleListing;