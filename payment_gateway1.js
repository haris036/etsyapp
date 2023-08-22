const fetch = require("node-fetch");
var headers = new fetch.Headers();
headers.append("Content-Type", "application/json");
// headers.append("Source", "Visa");
// headers.append("Recipient", "localhost");

let data = {
    api_key: "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TkRZNE5ERXNJbTVoYldVaU9pSnBibWwwYVdGc0luMC5obGNhekdnbWszbER1cEppVjVNS2hCbXJBWksyVDIzenVmUXVOM2xNaGVXSVN6LTNTcUcweGVMZUwyRXN4RHNna19mTkQxSHBMZ1hRbWYxNV9BRk9GUQ=="
}


var requestOptions = {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(data),
  redirect: 'follow'
};

fetch("https://pakistan.paymob.com/api/auth/tokens", requestOptions)
  .then(response =>response.json())
  .then(result => {
    console.log(result)
    return result
  })
  // .then(result => result)
  // .catch(error => console.log('error', error));

