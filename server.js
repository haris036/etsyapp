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
const forgotAuthPasswordToken = require('./middleware/forgot_password_token');
const otpAuthToken = require('./middleware/auth_otp_token');
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
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
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
  let is_single_listing = false;
  let response = await john.getListing(req.params.keyword, req.user.user, is_single_listing);
  res.status(response.status).end(JSON.stringify(response));
});


app.get('/getHistory', auth, async (req, res) => {
  var History = require("./history.js");
  var john = new History();
  let response = await john.getHistory(req.user.user);
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/me', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.getUserProfile(req.user.user,);
  let img_response = await john.getImage(req.user.user);
  if (img_response.status == 200) {
    if (img_response.image_data)
      response.user_info['image_url'] = img_response.image_data.file_path;

  }
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/generateEmail', auth, async (req, res) => {
  var EmailHelper = require("./helper/email_helper.js");
  var john = new EmailHelper();
  let response = await john.generateEmail(req.user.user, req.query.text, req.query.html, req.query.subject);
  res.status(response.status).end(JSON.stringify(response));
});


app.get('/signIn', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.getUser(req.query.email, req.query.password);
  if (response.status == 200) {
    let img_response = await john.getImage(req.query.email);
    if (img_response.status == 200) {
      if (img_response.image_data)
        response.user_info['image_url'] = img_response.image_data.file_path;
    }
  }
  res.status(response.status).end(JSON.stringify(response));
});


app.post('/changePassword', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.updateUserPassword(req.user.user, req.query.password);
  res.status(response.status).end(JSON.stringify(response));
});

app.post('/changePasswordByVerifyingOtp', otpAuthToken, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
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
  var image = {};
  if (req.file) {
    image = {
      file_path: req.file.path,
    };
    await john.saveImage(req.user.user, image)
  }


  let response = await john.updateProfile(
    req.user.user, req.body.name, req.body.date_of_birth,
    req.body.country, req.body.contact_no,);
  res.status(response.status).end(JSON.stringify(response))
});


app.get('/signUp', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.saveUser(
    req.query.email, req.query.password, req.query.is_subscribed,
    req.query.country, req.query.name);
  console.log(response)
  res.status(response.status).end(JSON.stringify(response));
  console.log(res)
});


app.get('/forgotPassword', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.forgotPassword(req.query.email);
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/image/:fileName', function (req, res) {
  const filePath = res.sendFile(filePath);
});

app.post('/verifyCode', forgotAuthPasswordToken, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  console.log(req.body)
  const { otp } = req.body;
  // console.log(otp)
  // console.log(req.user)
  let user_info_response = await john.getUserToken(req.user.user);
  // console.log(user_info_response)
  if (user_info_response.status == 200) {
    // console.log(user_info_response)
    let response = validateCode(otp, user_info_response.user_info);
    if (response.status == 200) {
      let tokenGenerator = new GenerateToken();
      let token_info = tokenGenerator.getVerifiedOtpToken(req.user.user,);
      response['access_token'] = token_info.access_token;
      await john.updateOtpExpiration(req.user.user, "Y");
    }
  }
  // console.log(response)
  res.status(response.status).end(JSON.stringify(response));
});



app.post('/updateSubsciption', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.updateSubscription(req.user.user, req.query.is_subscribed);
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/getSingleListing/:listing_id',
  auth,
  async (req, res) => {
    var SingleListing = require("./single_listing.js");
    var john = new SingleListing();
    let response = await john.getSingleListing(req.params.listing_id);
    res.status(response.status).end(JSON.stringify(response));
  });


app.get('/calculateProfit', auth, async (req, res) => {
  var ProfitCalculator = require("./profit_calculator.js");
  var john = new ProfitCalculator();
  let response = john.calculateProfit(parseFloat(req.query.cust_price), parseFloat(req.query.cust_shipping_price),
    parseFloat(req.query.cust_coupon), parseFloat(req.query.labor_cost), parseFloat(req.query.material_cost),
    parseFloat(req.query.shipping_cost), parseFloat(req.query.etsy_ads), parseFloat(req.query.renewing),
    parseFloat(req.query.offside_ads_fee_per));
  res.status(response.status).end(JSON.stringify(response));
});


app.get('/calenderHolidays', auth, async (req, res) => {
  var CalenderHolidays = require("./calender_holiday.js");
  var john = new CalenderHolidays();
  let response = await john.getCalenderHolidays();
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/paymentProcess', async (req, res) => {
  var PaymentGateway = require("./payment_gateway.js");
  var john = new PaymentGateway();
  let response = await john.subscribe(req.query.first_name, req.query.last_name, req.query.email);
  res.status(response.status).end(JSON.stringify(response));
});

//REFRESH TOKEN API
app.get("/refreshToken", authRefreshToken, (req, res) => {
  var tokenGenerator = new GenerateToken();
  response = tokenGenerator.getToken(req.user.user);
  res.status(200).json({ accessToken: response.access_token, refreshToken: response.refresh_token })
});

app.get("/me", auth, async (req, res) => {
  res.status(200).json(req.user.user)
});

app.post("/deleteAccount", auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.deleteAccount(req.user.user,);
  console.log(response)
  res.status(response.status).end(JSON.stringify(response));
});

function validateCode(otp, user_info_response) {
  console.log(user_info_response.otp)
  if (user_info_response.is_expired == "Y") {
    return response = {
      status: 404,
      msg: "Otp expired"
    }
  }
  if (user_info_response.otp == otp) {
    return response = {
      status: 200,
      msg: "verified"
    }
  }
  else {
    return response = {
      status: 404,
      msg: "invalid code"
    }
  }
}

// app.delete("/logout", auth, (req, res) => {
//   res.end("log out");
// })
/**
These variables contain your API Key, the state sent
in the initial authorization request, and the client verifier compliment
to the code_challenge sent with the initial authorization request
*/
// Start the server on port 3003
app.listen(process.env.PORT || 3003, 
	() => console.log("Server is running...")
);

