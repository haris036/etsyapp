// Import the express and fetch libraries
const express = require('express');
const fetch = require("node-fetch");
const fs = require('fs');
var http = require('http');
const OAuth = require('oauth');
const util = require('util');
var nodeUrl = require('url');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
// Create a new express application
const auth = require('./middleware/auth');

const app = express();
const cors = require("cors");

const corsOptions = {
  origin: '*',
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions));
// // var _OAuthToken = "";
// // var _OAuthTokenScret = "";
// var oa = new OAuth.OAuth(
//   'https://openapi.etsy.com/v2/oauth/request_token?scope=email_r%20listings_r',
//   'https://openapi.etsy.com/v2/oauth/access_token',
//   '7vudmbql4ympd8mrzsajli9n',
//   'wqbda069fr',
//   '1.0A',
//   "http://localhost:5000/callback",
//   'HMAC-SHA1'
// );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving public file
app.use(express.static(__dirname));

app.get('/', async (req, res) => {

  res.send("<h1>Server is running</h1>")
});

app.get('/getListing/:keyword', 
auth, 
async (req, res) => {
  var Listing = require("./listing.js");
  var john = new Listing();
  //sleep(500);
  let is_single_listing = false;
  let response = await john.getListing(req.params.keyword, req.user, is_single_listing);
  res.end(JSON.stringify(response));
});


app.get('/getHistory', 
auth, 
async (req, res) => {
  var History = require("./history.js");
  var john = new History();
  //sleep(500);
  let response = await john.getHistory(req.user.user);
  res.end(JSON.stringify(response));
});

app.get('/generateEmail', async (req, res) => {
  var EmailHelper = require("./helper/email_helper.js");
  var john = new EmailHelper();
  // console.log(req.session);
  // console.log(req)
  let response = await john.generateEmail();
  // console.log(response);
  res.end(JSON.stringify(response));
});


app.get('/signIn', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req.session);
  // console.log(req)
  let response = await john.getUser(req.query.email, req.query.password);
  // console.log(response);
  res.end(JSON.stringify(response));
});


app.get('/changePassword', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response = await john.updateUserPassword(req.query.email, req.query.password);
  res.end(JSON.stringify(response));
});

app.get('/updateCountry', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js")
  var john = new LoginOrSignUp();

  let response = await john.updateProfile(req.query.email, req.country);
  res.end(JSON.stringify(response))
});

app.get('/updateDateOfBirth', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js")
  var john = new LoginOrSignUp();

  let response = await john.updateProfile(req.query.email, req.date_of_birth);
  res.end(JSON.stringify(response))
});

app.get('/updateContactNo', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js")
  var john = new LoginOrSignUp();

  let response = await john.updateProfile(req.query.email, req.contact_no);
  res.end(JSON.stringify(response))
});

app.get('/signUp', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response = await john.saveUser(req.query.email, req.query.password, req.query.is_subscribed);
  res.end(JSON.stringify(response));
});

app.get('/updateSubsciption', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response = await john.updateSubscription(req.query.email, req.query.is_subscribed);
  res.end(JSON.stringify(response));
});

app.get('/getSingleListing/:listing_id', 
 auth, 
async (req, res) => {
  var SingleListing = require("./single_listing.js");
  // sleep(500);
  var john = new SingleListing();
  let response = await john.getSingleListing(req.params.listing_id);
  res.end(JSON.stringify(response));
});


app.get('/calculateProfit', auth, async (req, res) => {
  var ProfitCalculator = require("./profit_calculator.js");
  var john = new ProfitCalculator();
  // console.log(req)
  let response = john.calculateProfit(parseFloat(req.query.cust_price), parseFloat(req.query.cust_shipping_price),
    parseFloat(req.query.cust_coupon), parseFloat(req.query.labor_cost), parseFloat(req.query.material_cost),
    parseFloat(req.query.shipping_cost), parseFloat(req.query.etsy_ads), parseFloat(req.query.renewing),
    parseFloat(req.query.offside_ads_fee_per));
  res.end(JSON.stringify(response));
});


app.get('/calenderHolidays', auth, async (req, res) => {
  var CalenderHolidays = require("./calender_holiday.js");
  var john = new CalenderHolidays();
  // console.log(req)
  let response = await john.getCalenderHolidays();
  res.end(JSON.stringify(response));
});

app.get('/paymentProcess', async (req, res) => {
  var PaymentGateway = require("./payment_gateway.js");
  var john = new PaymentGateway();
  // console.log(req)
  let response = await john.subscribe(req.query.first_name, req.query.last_name, req.query.email);
  res.end(JSON.stringify(response));
});

//REFRESH TOKEN API
app.post("/refreshToken", auth, (req, res) => {
  
    // res.status(400).send("Refresh Token Invalid")
    //refreshTokens = refreshTokens.filter((c) => c != req.body.token)
  //remove the old refreshToken from the refreshTokens list
  const accessToken = generateAccessToken({ user: req.body.name })
  const refreshToken = generateRefreshToken({ user: req.body.name })
  //generate new accessToken and 
  res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.get('/forgotPassword', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response = await john.forgotPassword(req.query.email);
  res.end(JSON.stringify(response));
});

app.post("/deleteAccount", auth, (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response =  john.deleteAccount(req.query.email,);
  res.end(JSON.stringify(response));
})

// app.get('/callbackUrl', async (req, res) => {
//   console.log("request: "+ JSON.stringify(req));
//   console.log("response: "+ JSON.stringify(res));
// });

/**
These variables contain your API Key, the state sent
in the initial authorization request, and the client verifier compliment
to the code_challenge sent with the initial authorization request
*/
// Start the server on port 3003
app.listen(process.env.PORT || 3003, 
	() => console.log("Server is running...")
    );
