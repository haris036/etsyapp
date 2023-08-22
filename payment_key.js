const fetch = require("node-fetch");
var headers = new fetch.Headers();
headers.append("Content-Type", "application/json");
// headers.append("Source", "Visa");
// headers.append("Recipient", "localhost");

let data = {
    
    
        auth_token: "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TkRZNE5ERXNJbkJvWVhOb0lqb2lOakpsWW1VNE5tWmtOekUyWlRCaU1XVXhNR1k1WTJSaVptUmlNalpqT0dJeE1UTm1aR1l5Tm1SaFl6RXhNVFkwTUdFMFlUbGxNRFV5TldKaFlXUmpOU0lzSW1WNGNDSTZNVFkzTURNME5qY3pPSDAuRzVPVmpOTWd4WlZ0ci1IOERhZjByS0JuSWk4azBYWWR6QUxNZ2MtX0RrZ0N4WjlndHJMa3NIS3JmZm5vZ1RiNEZRU0FQMGFISFJScW1uTlVtaWx4Qnc=",
        amount_cents: "10", 
        expiration: 3600, 
        order_id: "142982",
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

fetch("https://pakistan.paymob.com/api/acceptance/payment_keys", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));