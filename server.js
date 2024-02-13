const express = require('express');
require('dotenv').config()
const fetch = require("node-fetch");
const fs = require('fs');
var http = require('http');
const OAuth = require('oauth');
const util = require('util');
var nodeUrl = require('url');
const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const auth = require('./middleware/auth');
const authRefreshToken = require('./middleware/auth_refresh_token');
const forgotAuthPasswordToken = require('./middleware/forgot_password_token');
const otpAuthToken = require('./middleware/auth_otp_token');
const GenerateToken = require("./generator/token_generator");
const app = express();
const cors = require("cors");
var multer = require('multer');
var path = require('path');
var bodyParser = require('body-parser');
const api_keys = process.env.API_KEYS.split(',')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const TagListing = require("./tags_listing.js");

// console.log(process.env.API_KEYS)
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
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.get('/', async (req, res) => {
  res.send("<h1>Server is running</h1>")
});

app.use(
  express.json({
    // We need the raw body to verify webhook signatures.
    // Let's compute it only when hitting the Stripe webhook endpoint.
    verify: function (req, res, buf) {
      if (req.originalUrl.startsWith("/webhook")) {
        req.rawBody = buf.toString();
      }
    },
  })
);

app.post('/add_stripe_customer', auth, async (req, res) => {
  // console.log(req.body)
  var LoginOrSignUp = require("./login_or_signup.js");
  const req_customer = req.body.customer;
  try {
    const customer = await stripe.customers.create
      ({
        email
          : req_customer.email,
        name
          : req_customer.name,
        shipping
          : {
          address
            : {
            city
              : req_customer.city,
            country
              : req_customer.country,
            line1
              : req_customer.street,
            postal_code
              : req_customer.postal_code,
            state
              : req_customer.state,
          },
          name: req_customer.name,
        },
        address
          : {
          city
            : req_customer.city,
          country
            : req_customer.country,
          line1
            : req_customer.street,
          postal_code
            : req_customer.postal_code,
          state
            : req_customer.state,
        },
      });

    var john = new LoginOrSignUp();
    let response = await john.saveStripeUser(req.user.user, customer.id);

    if (response.status != 200) {
      return res.status(response.status).send(response);
    }

    response["customer_id"] = customer.id;
    console.log(response)
    return res.status(200).send(response);
  } catch (e) {
    return res.status(500).send(e);
  }
});


app.post('/create-subscription', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  try {
    const customerId = req.body.customerId;
    const priceId = req.body.priceId;
    const subscription = await stripe.subscriptions.create
      ({
        customer
          : customerId,
        items
          : [{
            price
              : priceId,
          }],
        payment_behavior
          : 'default_incomplete',
        payment_settings
          : {
          save_default_payment_method
            : 'on_subscription'
        },
        expand
          : ['latest_invoice.payment_intent'],
      });
    var john = new LoginOrSignUp();
    let response = await john.updateStripeSubscriptionIdAndStatus(req.user.user, subscription.id, subscription.status);
    if (response.status != 200) {
      return res.status(response.status).send(response);
    }
    res.status(200).send(
      response = {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      }
    );
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});


app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  var LoginOrSignUp = require("./login_or_signup.js");
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(err);
    console.log(`⚠️  Webhook signature verification failed.`);
    console.log(
      `⚠️  Check the env file and enter the correct webhook secret.`
    );
    return res.sendStatus(400);
  }
  // Extract the object from the event.
  const dataObject = event.data.object;
  let response;
  // Handle the event
  // Review important events for Billing webhooks
  // https://stripe.com/docs/billing/webhooks
  // Remove comment to see the various objects sent for this sample
  switch (event.type) {
    case 'invoice.paid':
      var john = new LoginOrSignUp();
      response = await john.updateStripeSubscriptionStatus(dataObject.id, "active");

      break;
    case 'invoice.payment_failed':
      var john = new LoginOrSignUp();
      response = await john.updateStripeSubscriptionStatus(dataObject.id, "in-active");
      break;
    case 'customer.subscription.deleted':
      if (event.request == null) {
        var john = new LoginOrSignUp();
        response = await john.updateStripeSubscriptionStatus(dataObject.id, "un-subscribe");
      }
      break;
    default:
    // Unexpected event type
  }
  res.sendStatus(200);
}
);

app.post('/cancel-subscription', async (req, res) => {
  const deletedSubscription = await stripe.subscriptions.del(
    req.body.subscriptionId
  );
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  response = await john.updateStripeSubscribtionIdAndStatus(dataObject.id, "un-subscribe");
  if (response != 200) {
    return res.status(response.status).send(response);
  }
  res.status(200).send(deletedSubscription);
});

app.get('/getListing/:keyword', auth, async (req, res) => {
  var Listing = require("./listing.js");
  var john = new Listing();
  let is_single_listing = false;
  let response = await john.getListing(req.params.keyword, req.user.user, is_single_listing);
  res.status(response.status).end(JSON.stringify(response));
});



app.post('/nextSimilarShopperTags', auth, async (req, res) => {
  let keyword = req.body.keyword;
  let start_index = req.body.start_index;
  // let ending_index = start_index+10;
  var tag_listing = new TagListing;
  // if (ending_index > similar_shopper_lists.length) {
  //   ending_index = similar_shopper_lists.length;
  // }

  let response = await tag_listing.getTagListing(keyword, start_index, 2);
  console.log(response)
  res.status(response.status).end(JSON.stringify(response));
});



app.post('/nextLongTailAlternativeTags', auth, async (req, res) => {
  let keyword = req.body.keyword;
  let start_index = req.body.start_index;
  // let ending_index = start_index+10;
  var tag_listing = new TagListing;
  // if (ending_index > similar_shopper_lists.length) {
  //   ending_index = similar_shopper_lists.length;
  // }

  let response = await tag_listing.getTagListing(keyword, start_index, 3);
  res.status(response.status).end(JSON.stringify(response));
});


app.post('/nextPopularTags', auth, async (req, res) => {
  // console.log(req.body)
  // let map = new Map(Object.entries(req.body.popular_tags_list_map));
  // console.log(map)
  let keyword = req.body.keyword;
  let start_index = req.body.start_index;
  // let ending_index = start_index+10;
  var tag_listing = new TagListing;
  // if (ending_index > similar_shopper_lists.length) {
  //   ending_index = similar_shopper_lists.length;
  // }

  let response = await tag_listing.getTagListing(keyword, start_index, 1);
  res.status(response.status).end(JSON.stringify(response));

});



app.post('/registerForNewsAndUpdates', async (req, res) => {
  let email = req.body.email;
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let is_single_listing = false;
  let response = await john.registerForNewsAndUpdates(req.body.email,);
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
  let stripe_response = await john.getStripeData(req.user.user);
  console.log(img_response)
  if (img_response.status == 200 && img_response.image_data) {
      response.user_info['image_url'] = img_response.image_data.file_path ? img_response.image_data.file_path : null;
  }
  console.log(stripe_response)
  if (stripe_response.status == 200 && stripe_response.stripe_info) {
    response.user_info['customer_id'] = stripe_response.stripe_info.customer_id;
    response.user_info['subscription_id'] = stripe_response.stripe_info.subscription_id;
    response.user_info['subscription_status'] = stripe_response.stripe_info.subscription_status;

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
    if (img_response.status == 200 && img_response.image_data) {
        response.user_info['image_url'] = img_response.image_data.file_path;
    }
    let stripe_response = await john.getStripeData(req.query.email);
    if (stripe_response.status == 200 && stripe_response.stripe_info) {
      response.user_info['customer_id'] = stripe_response.stripe_info.customer_id;
      response.user_info['subscription_id'] = stripe_response.stripe_info.subscription_id;
      response.user_info['subscription_status'] = stripe_response.stripe_info.subscription_status;
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


// "city": "",
// "street": "",
// "postal_code": "",
// "state": ""

app.get('/signUp', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response;
  try {
    console.log(req.query)
    const customer = await stripe.customers.create
    ({
      email
        : req.query.email,
      name
        : req.query.name,
      shipping
        : {
        address
          : {
          city
            : req.query.city,
          country
            : req.query.country,
          line1
            : req.query.street,
          postal_code
            : req.query.postal_code,
          state
            : req.query.state,
        },
        name: req.query.name,
      },
      address
        : {
        city
          : req.query.city,
        country
          : req.query.country,
        line1
          : req.query.street,
        postal_code
          : req.query.postal_code,
        state
          : req.query.state,
      },
    });
  
    var john = new LoginOrSignUp();
    console.log(customer)
    let response_stripe = await john.saveStripeUser(req.query.email, customer.id);
    response = await john.saveUser(
    req.query.email, req.query.password, req.query.is_subscribed,
    req.query.country, req.query.name, req.query.city,
    req.query.street, req.query.postal_code, req.query.state);
  
    if (response_stripe.status != 200) {
      return res.status(response.status).send(response);
    }

    response["customer_id"] = customer.id;
  } catch (e) {
    console.log(e)
    return res.status(500).send(e);
  }
  console.log(response)
  res.status(response.status).end(JSON.stringify(response));
});

app.get('/forgotPassword', async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.forgotPassword(req.query.email);
  console.log(response)
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
  let user_info_response = await john.getUserToken(req.user.user);
  if (user_info_response.status == 200) {
    let response = validateCode(otp, user_info_response.user_info);
    if (response.status == 200) {
      let tokenGenerator = new GenerateToken();
      let token_info = tokenGenerator.getVerifiedOtpToken(req.user.user,);
      response['access_token'] = token_info.access_token;
      await john.updateOtpExpiration(req.user.user, "Y");
    }
  }
  res.status(response.status).end(JSON.stringify(response));
});

app.post('/updateSubsciption', auth, async (req, res) => {
  var LoginOrSignUp = require("./login_or_signup.js");
  var john = new LoginOrSignUp();
  let response = await john.updateSubscription(req.user.user, req.query.is_subscribed);
  res.status(response.status).end(JSON.stringify(response));
});

app.post('/getSingleListing',
  auth,
  async (req, res) => {
    let string = req.body.listing_id;
    var SingleListing = require("./single_listing.js");
    var john = new SingleListing();
    let response = await john.getSingleListing(string);
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

// app.get("/me", auth, async (req, res) => {
//   res.status(200).json(req.user.user)
// });

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

