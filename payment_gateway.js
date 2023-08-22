const fetch = require("node-fetch");
var headers = new fetch.Headers();
headers.append("Content-Type", "application/json");
const fs = require('fs');
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var method = PaymentGateway.prototype;
function PaymentGateway() { };


method.subscribe = async function (first_name, last_name, email) {
    let auth_data = {
        api_key: api_key_info.paymob_api_key
    }
    var authRequestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(auth_data),
        redirect: 'follow'
    };

    let response = await fetch("https://pakistan.paymob.com/api/auth/tokens", authRequestOptions)
        .then(response => response.json())
        .catch(error => console.log('error', error));
    // console.log(response);
    let auth_token = response.token;


    let order_data = {

        auth_token: auth_token,
        delivery_needed: "false",
        amount_cents: "1900",
        currency: "USD",
        items: [
            {
                name: "Subscription Payment",
                amount_cents: "10",
                description: "E-Prime data subscription payment",
            },
        ],

    }




    var orderRequestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(order_data),
        redirect: 'follow'
    };

    response = await fetch("https://pakistan.paymob.com/api/ecommerce/orders", orderRequestOptions)
        .then(response => response.json())
        .catch(error => console.log('error', error));
    // console.log(response);
    let id = response.id;


    let data = {


        auth_token: auth_token,
        amount_cents: "1900",
        expiration: 3600,
        order_id: id,
        billing_data: {
            apartment: "NA",
            email: email,
            floor: "NA",
            first_name: first_name,
            street: "NA",
            building: "NA",
            phone_number: "NA",
            postal_code: "NA",
            extra_description: "NA",
            city: "NA",
            country: "NA",
            last_name: last_name,
            state: "NA"
        },
        currency: "PKR",
        integration_id: 48242,
        lock_order_when_paid: "false",

    }




    var requestOptions = {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
        redirect: 'follow'
    };

    response = await fetch("https://pakistan.paymob.com/api/acceptance/payment_keys", requestOptions)
        .then(response => response.json())
        .catch(error => console.log('error', error));
    // console.log(response);
    let payment_key = response.token;
    let returnResponse = {
        url: "https://pakistan.paymob.com/api/acceptance/iframes/71516?payment_token=" + payment_key
    }

    return returnResponse;
}

module.exports = PaymentGateway;