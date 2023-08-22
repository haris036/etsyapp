// const fetch = require("node-fetch");

// // api url
// const api_url = 
//       "https://openapi.etsy.com/v2/listings/active?api_key=7vudmbql4ympd8mrzsajli9n&limit=100&keywords=ps4&sort_on=score";
  
// // Defining async function
// async function getapi(url) {
    
//     // Storing response
//     const response = await fetch(url);
    
//     // Storing data in form of JSON
//     var data = await response.json();
//     console.log(data);
    
// }
// // Calling that async function
// getapi(api_url);

// create string to array

var strJson = {

    name: "Nicesnippets.com"

};
strJson['new'] = 1;

// convert string to json

var strJson = JSON.stringify(strJson);


console.log(strJson); 