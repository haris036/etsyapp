// Import the express and fetch libraries
const express = require('express');
const fetch = require("node-fetch");
const fs = require('fs');
var http = require('http');
const OAuth = require('oauth');
var nodeUrl = require('url');
// Create a new express application


const app = express();
const cors = require("cors");

const corsOptions = {
    origin: '*',
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions));
var _OAuthToken ="";
var _OAuthTokenScret = "";
var oa = new OAuth.OAuth(
    'https://openapi.etsy.com/v2/oauth/request_token?scope=email_r%20listings_r',
    'https://openapi.etsy.com/v2/oauth/access_token',
    '7vudmbql4ympd8mrzsajli9n',
    'wqbda069fr',
    '1.0A',
    "http://localhost:5000/callback",
    'HMAC-SHA1'
);

// This renders our `index.hbs` file.
app.get('/', async (req, res) => {
    //res.send("<h1>Server is running</h1>")
    oa.getOAuthRequestToken(function (error, oAuthToken, oAuthTokenSecret, results) {
        console.log(oAuthToken);
        console.log(oAuthTokenSecret);
        console.log(results.login_url);
        _OAuthToken = oAuthToken;
        _OAuthTokenScret = oAuthTokenSecret;
        
        // var urlObj = nodeUrl.parse(req.url, true);
        var body = '<a href="' + results.login_url + '"> Get Code </a>';
        res.writeHead(200, {
            'Content-Length': body.length,
            'Content-Type': 'text/html'
        });
        res.end(body);
    });

});

app.get('/getListing/:keyword', async (req, res) => {
    var Listing = require("./listing.js");
    var john = new Listing();
    let response = await john.getListing(req.params.keyword);
    res.end(JSON.stringify(response));
});

app.get('/getSingleListing/:listing_id', async (req, res) => {
    var SingleListing = require("./single_listing.js");
    var john = new SingleListing();
    let response = await john.getSingleListing(req.params.listing_id);
    res.end(JSON.stringify(response));
});

app.get('/callback', async (req, res) => {
    console.log("Asd");
    var urlObj = nodeUrl.parse(req.url, true);
    var getOAuthRequestTokenCallback = function (error, oAuthAccessToken,
        oAuthAccessTokenSecret, results) {
        if (error) {
          console.log(error);
          res.end(JSON.stringify({
            message: 'Error occured while getting access token',
            error: error
          }));
          return;
        }
        console.log(oAuthAccessToken);
        console.log(oAuthAccessTokenSecret);
        console.log(results)
        oa.get("https://openapi.etsy.com/v2/users/__SELF__",
          oAuthAccessToken,
          oAuthAccessTokenSecret,
          function (error, twitterResponseData, result) {
            if (error) {
              console.log(error)
              res.end(JSON.stringify(error));
              return;
            }
            try {
              console.log(JSON.parse(twitterResponseData));
              // console.log(result);
            } catch (parseError) {
              console.log(parseError);
            }
            console.log(twitterResponseData);
            fs.appendFile('access_token.txt', twitterResponseData  +" \n" +oAuthAccessToken+ " \n"+ oAuthAccessTokenSecret +"\n", function (err) {
              if (err) throw err;
              console.log('Saved!');
            }); 
            res.end(twitterResponseData);
          });
      };
      console.log(urlObj.query);
      console.log(urlObj.query.oauth_token)
      let response = oa.getOAuthAccessToken(urlObj.query.oauth_token, _OAuthTokenScret,
        urlObj.query.oauth_verifier,
        getOAuthRequestTokenCallback);
        Promise.resolve(response);
        fs.appendFile('access_token.txt', response +"  yo\n ", function (err) {
          if (err) throw err;
          console.log('Saved!');
        }); 
});

// Start the server on port 3003
app.listen(process.env.PORT || 3003, 
	() => console.log("Server is running...")
    );
