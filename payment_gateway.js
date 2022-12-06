const fetch = require("node-fetch");
var headers = new fetch.Headers();
headers.append("Content-Type", "application/json");
const fs = require('fs');
let api_key_info = JSON.parse(fs.readFileSync("api_key.json"));
var method = PaymentGateway.prototype;
function PaymentGateway() { };


module.subscribe = async function () {
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

    let auth_token = response.token;


    let order_data = {

        auth_token: auth_token,
        delivery_needed: "false",
        amount_cents: "10",
        currency: "PKR",
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

    let id = response.id;


    let data = {


        auth_token: auth_token,
        amount_cents: "10",
        expiration: 3600,
        order_id: id,
        billing_data: {
            apartment: "573",
            email: "haris.arif103@gmail.com",
            floor: "1",
            first_name: "Muhammad",
            street: "Shamnagar",
            building: "573",
            phone_number: "+923004008602",
            postal_code: "54000",
            extra_description: "8 Ram , 128 Giga",
            city: "Lahore",
            country: "PK",
            last_name: "Haris",
            state: "Utah"
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
    let payment_key = response.token;
    let returnResponse = {
        url: "https://pakistan.paymob.com/api/acceptance/iframes/71516?payment_token=" + payment_key
    }

    return returnResponse;
}
