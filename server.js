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
const authRefreshToken = require('./middleware/auth_refresh_token');
const GenerateToken = require("./generator/token_generator")
const app = express();
const cors = require("cors");
var multer = require('multer');
var path = require('path');
var bodyParser = require('body-parser');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
 
var upload = multer({ storage: storage });
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

app.get('/getListing/:keyword', auth, async (req, res) => {
  var Listing = require("./listing.js");
  var john = new Listing();
  //sleep(500);
  let is_single_listing = false;
  let response = await john.getListing(req.params.keyword, req.user, is_single_listing);
  res.status(response.status).end(JSON.stringify(response));
});


app.get('/getHistory', auth, async (req, res) => {
  var History = require("./history.js");
  var john = new History();
  //sleep(500);
  let response = await john.getHistory(req.user.user);
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/getProfile', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.getUser(req.user.user,);
  let img_response = await john.getImage(req.user.user);
  // let image_data;
  if (img_response.status == 200) {
    response['image_data'] = img_response.image_data;
  }
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/generateEmail', auth, async (req, res) => {
  var EmailHelper = require("./helper/email_helper.js");
  var john = new EmailHelper();
  // console.log(req.session);
  // console.log(req)
  let response = await john.generateEmail(req.user.user, req.query.text, req.query.html, req.query.subject);
  // console.log(response);
  res.status(response.status).end(JSON.stringify(response));
});


app.get('/signIn', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.getUser(req.query.email, req.query.password);
  console.log(response)
  res.status(response.status).end(JSON.stringify(response));
});


app.post('/changePassword', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response = await john.updateUserPassword(req.user.user, req.query.password);
  res.status(response.status).end(JSON.stringify(response));
});

app.post('/updateCountry', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js")
  var john = new LoginOrSignUp();

  let response = await john.updateCountry(req.user.user, req.query.country);
  res.status(response.status).end(JSON.stringify(response))
});

app.post('/updateDateOfBirth', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js")
  var john = new LoginOrSignUp();

  let response = await john.updateDateOfBirth(req.user.user, req.query.date_of_birth);
  res.status(response.status).end(JSON.stringify(response))
});

app.post('/updateContactNo', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js")
  var john = new LoginOrSignUp();

  let response = await john.updateContactNo(req.user.user, req.query.contact_no);
  res.status(response.status).end(JSON.stringify(response))
});

app.post('/updateProfile', auth, upload.single('image'), async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js")
  var john = new LoginOrSignUp();
  console.log(__dirname)
  var image = {};
  if (req.file) {
    image = {
      name: req.body.name,
      desc: req.body.desc,
      data: fs.readFileSync(path.join(__dirname + '/images/' + req.file.filename)),    
    };
    john.saveImage(req.user.user, image)
  }
  
  
  let response = await john.updateProfile(req.user.user, req.query.date_of_birth, req.query.country, req.query.contact_no,);
  res.status(response.status).end(JSON.stringify(response))
});


app.get('/signUp', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response = await john.saveUser(req.query.email, req.query.password, req.query.is_subscribed);
  console.log(response)
  res.status(response.status).end(JSON.stringify(response));
  console.log(res)
});


app.get('/forgotPassword', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response = await john.forgotPassword(req.query.email);
  
  res.status(response.status).end(JSON.stringify(response));
});


app.post('/updateSubsciption', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response = await john.updateSubscription(req.user.user, req.query.is_subscribed);
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/getSingleListing/:listing_id', 
 auth, 
async (req, res) => {
  var SingleListing = require("./single_listing.js");
  // sleep(500);
  var john = new SingleListing();
  let response = await john.getSingleListing(req.params.listing_id);
  res.status(response.status).end(JSON.stringify(response));
});


app.get('/calculateProfit', auth, async (req, res) => {
  var ProfitCalculator = require("./profit_calculator.js");
  var john = new ProfitCalculator();
  // console.log(req)
  let response = john.calculateProfit(parseFloat(req.query.cust_price), parseFloat(req.query.cust_shipping_price),
    parseFloat(req.query.cust_coupon), parseFloat(req.query.labor_cost), parseFloat(req.query.material_cost),
    parseFloat(req.query.shipping_cost), parseFloat(req.query.etsy_ads), parseFloat(req.query.renewing),
    parseFloat(req.query.offside_ads_fee_per));
    res.status(response.status).end(JSON.stringify(response));
});


app.get('/calenderHolidays', auth, async (req, res) => {
  var CalenderHolidays = require("./calender_holiday.js");
  var john = new CalenderHolidays();
  // console.log(req)
  let response = await john.getCalenderHolidays();
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/paymentProcess', async (req, res) => {
  var PaymentGateway = require("./payment_gateway.js");
  var john = new PaymentGateway();
  // console.log(req)
  let response = await john.subscribe(req.query.first_name, req.query.last_name, req.query.email);
  res.status(response.status).end(JSON.stringify(response));
});

//REFRESH TOKEN API
app.get("/refreshToken", authRefreshToken, (req, res) => {
  var tokenGenerator = new GenerateToken();
  response = tokenGenerator.getToken(req.user.user);
    // res.status(400).send("Refresh Token Invalid")
    //refreshTokens = refreshTokens.filter((c) => c != req.body.token)
  //remove the old refreshToken from the refreshTokens list
  
  //generate new accessToken and 
  res.status(200).json({ accessToken: response.access_token, refreshToken: response.refresh_token })
})

app.post("/deleteAccount", auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  // console.log(req)
  let response =  await john.deleteAccount(req.user.user,);
  console.log(response)
  res.status(response.status).end(JSON.stringify(response));
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
