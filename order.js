const fetch = require("node-fetch");
var headers = new fetch.Headers();
headers.append("Content-Type", "application/json");
// headers.append("Source", "Visa");
// headers.append("Recipient", "localhost");

let data = {
    
        auth_token:  "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TkRZNE5ERXNJbkJvWVhOb0lqb2lOakpsWW1VNE5tWmtOekUyWlRCaU1XVXhNR1k1WTJSaVptUmlNalpqT0dJeE1UTm1aR1l5Tm1SaFl6RXhNVFkwTUdFMFlUbGxNRFV5TldKaFlXUmpOU0lzSW1WNGNDSTZNVFkzTURNME5qY3pPSDAuRzVPVmpOTWd4WlZ0ci1IOERhZjByS0JuSWk4azBYWWR6QUxNZ2MtX0RrZ0N4WjlndHJMa3NIS3JmZm5vZ1RiNEZRU0FQMGFISFJScW1uTlVtaWx4Qnc=",
        delivery_needed: "false",
        amount_cents: "10",
        currency: "PKR",
        items: [
          {
              name: "ASC1515",
              amount_cents: "50000",
              description: "Watch",
              quantity: "1"
          },
          { 
              name: "ERT6565",
              amount_cents: "20000",
              description: "Bank",
              quantity: "1"
          }
          ],
        
      }
      



var requestOptions = {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(data),
  redirect: 'follow'
};

fetch("https://pakistan.paymob.com/api/ecommerce/orders", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));