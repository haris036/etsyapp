var http = require('http');
var OAuth = require('oauth');
var nodeUrl = require('url');
const fs = require('fs');
var clientID = '';
var clientSecret = '';
var callbackURL = '';

var oa = new OAuth.OAuth(
  'https://openapi.etsy.com/v2/oauth/request_token?scope=email_r%20listings_r',
  'https://openapi.etsy.com/v2/oauth/access_token',
  '7vudmbql4ympd8mrzsajli9n',
  'wqbda069fr',
  '1.0A',
  "localhost:3000/callback",
  'HMAC-SHA1'
);


http.createServer(function (request, response) {
  oa.getOAuthRequestToken(function (error, oAuthToken, oAuthTokenSecret, results) {

    var urlObj = nodeUrl.parse(request.url, true);

    // console.log(urlObj);
    // console.log(urlObj.login_url);
    console.log(oAuthToken);
    console.log(oAuthTokenSecret);
    console.log(results.login_url);
    var authURL = results.login_url;
    var handlers = {
      '/': function (request, response) {
        /**
         * Creating an anchor with authURL as href and sending as response
         */
        var body = '<a href="' + authURL + '"> Get Code </a>';
        response.writeHead(200, {
          'Content-Length': body.length,
          'Content-Type': 'text/html'
        });
        response.end(body);

      },
      '/callback': function (request, response) {
        /** Obtaining access_token */
        var getOAuthRequestTokenCallback = function (error, oAuthAccessToken,
          oAuthAccessTokenSecret, results) {
          if (error) {
            console.log(error);
            response.end(JSON.stringify({
              message: 'Error occured while getting access token',
              error: error
            }));
            return;
          }
          console.log(results)
          oa.get('https://api.twitter.com/1.1/account/verify_credentials.json',
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
              } catch (parseError) {
                console.log(parseError);
              }
              console.log(twitterResponseData);
              response.end(twitterResponseData);
            });
        };

       let response =  oa.getOAuthAccessToken(urlObj.query.oauth_token, oAuthTokenSecret,
          urlObj.query.oauth_verifier,
          getOAuthRequestTokenCallback);

      }

      

    };
   // handlers[urlObj.pathname](request, response);
  })

}).listen(3000);
