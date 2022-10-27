const fetch = require("node-fetch");
const fs = require('fs');
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var method = CalenderHolidays.prototype;
function CalenderHolidays() { }

method.getCalenderHolidays = async function () {
    const d = new Date();
    let year = d.getFullYear().toString();
    var countries_holidays = new Map();
    let country_holidays = [];
    let holidays = new Set();
    let countries = [];
    countries.push("US", "DE", "UK");

    for (const country of countries) {
        console.log(country)
        let url = (
            'https://calendarific.com/api/v2/holidays?' +
            new URLSearchParams({
                api_key: api_key_info.calender_api_key,
                country: country,
                year: year,
            }).toString()

        );
        console.log(url);


        let response = await fetch(url);
        let results = await response.json();

        if (response.status == 200) {
            // console.log(results.response.holidays)
            for(const result_holiday of results.response.holidays){
                let holiday = {
                    name: result_holiday.name,
                    description: result_holiday.description,
                    country: result_holiday.country.name,
                    date: result_holiday.date.iso,
                }
                if (!holidays.has(holiday.name+holiday.date)){
                    country_holidays.push(holiday);
                    holidays.add(holiday.name+holiday.date);
                }
            }
            countries_holidays.set(country, country_holidays);
            // console.log(shipping_day_prices);
           



        } else {
            return `Error in getting results received respose code: ${response.status} response description: ${response.statusText}`;
        }
        holidays.clear();
    }
    let country_holidays_arr = Array.from(country_holidays);
    let result = {
        country_holidays: country_holidays_arr,
    }
    return result;
}


function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
module.exports = CalenderHolidays;