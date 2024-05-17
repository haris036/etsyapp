const { MongoClient } = require("mongodb");
// const jwt = require("jsonwebtoken");
const username = encodeURIComponent("harisarif103");

const password = encodeURIComponent("Temp.123");

const cluster = "mycluster.u9r3f1e.mongodb.net";
const { generateOTP } = require("./helper/otp_generator");
const GenerateToken = require("./generator/token_generator")
var method = LoginOrSignup.prototype;
function LoginOrSignup() { }

let uri = `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);


method.saveUser = async function (_email, _password,  _country, _name, _city, _street, _postal_code, _state) {
  let usr = "";
  let insert_id = "";
  try {

    await client.connect();
    usr = _email.substr(0, _email.indexOf('@'));
    const database = client.db("etsy_database");
    console.log(usr)
    const collection = database.collection("user_data");

    const doc = {
      user: usr,
      password: _password,
      creation_time: Date.now(),
      email: _email,
      country: _country,
      name: _name,
      last_updated: null,
      expiry: Date.now() + 2592000,
      subscribed_date: Date.now(),
      city: _city,
      street: _street,
      postal_code: _postal_code,
      state: _state,
    };
    const result = await collection.insertOne(doc);

    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    insert_id = result.insertedId;
  } catch (e) {
    console.log(e)
    if (e.code === 11000) {
      let response = {
        status: 400,
        error_msg: "User already exists with same email id",
      }
      console.log(response)
      return response;

    }
    else {
      let response = {
        status: 500,
        error_msg: e,
      }
      return response;
    }
  } finally {
    await client.close();
  }
  let response = {
    status: 200,
    user: usr,
    inserted_id: insert_id,
  }
  return response;
}

method.updateUserPassword = async function (_email, _password) {
  try {
    await client.connect();
    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        password: _password,
        last_updated: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);
  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {
    await client.close();
  }
  let response = {
    status: 200,
    msg: "Updated",
  }
  return response;
}

// method.updateSubscription = async function (_email, _is_subscribed) {
//   try {
//     await client.connect();
//     var dbo = client.db("etsy_database");
//     var myquery = { email: _email };
//     var newvalues = {
//       $set: {
//         is_subscribed: _is_subscribed,
//         last_updated: Date.now(),
//         subscribed_date: Date.now()
//       }
//     };
//     await dbo.collection("user_data").updateOne(myquery, newvalues);
//   } catch (e) {
//     let response = {
//       status: 400,
//       error_msg: e.message,
//     }
//     return response;
//   } finally {
//     await client.close();
//   }
//   let response = {
//     status: 200,
//     msg: "Updated",
//   }
//   return response;
// }

method.updateOtpExpiration = async function (_email, _is_expired) {
  try {
    await client.connect();
    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        is_expired: _is_expired,
      }
    };
    await dbo.collection("user_tokens").updateOne(myquery, newvalues);
  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {

    await client.close();

  }
  let response = {
    status: 200,
    msg: "Updated",
  }
  return response;
}
method.getUserToken = async function (_email,) {
  let user_info;
  try {
    await client.connect();
    const database = client.db("etsy_database");
    const users = database.collection("user_tokens");
    const user_data = await users.findOne({ email: _email });
    let response;
    if (user_data == null) {
      return response = {
        status: 404,
        error_msg: "No user found",
      }
    }

    user_info = {
      otp: user_data.otp,
      is_expired: user_data.is_expired,
    }
    console.log(user_info)
  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {
    await client.close();
  }
  let response = {
    status: 200,
    user_info: user_info,
  }
  return response;
}


method.getUser = async function (_email, _password) {

  let user_info;
  try {

    await client.connect();

    const database = client.db("etsy_database");
    const users = database.collection("user_data");
    const user_data = await users.findOne({ email: _email });
    let response;
    var tokenGenerator = new GenerateToken();
    if (user_data == null) {
      return response = {
        status: 404,
        error_msg: "No user found",
      }
    }
    if (user_data.password == _password) {
      response = tokenGenerator.getToken(_email);
    }
    var creation_date = null;
    if (user_data.creation_time) {
      // var utcSeconds = user_data.creation_time;
      creation_date = new Date(user_data.creation_time); // The 0 there is the key, which sets the date to the epoch
      // console.log(utcSeconds)
      // creation_date.setUTCSeconds(utcSeconds);
      console.log(creation_date.toISOString())
      // creation_date_string = creation_date.getFullYear() + "-" + (formatData(creation_date.getMonth() + 1)) + "-" + formatData(creation_date.getDate());
    }
    // console.log(creation_date_string)
    user_info = {
      email: user_data.email,
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      name: user_data.name,
      user_id: user_data.user,
      // is_subscribed: user_data.is_subscribed,
      contact_no: user_data.contact_no ? user_data.contact_no : null,
      country: user_data.country ? user_data.country : null,
      date_of_birth: user_data.date_of_birth ? user_data.date_of_birth : null,
      creation_date: creation_date.toISOString(),
    }
    console.log(user_info)
  } catch (e) {
    console.log(e)
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;

  } finally {

    await client.close();

  }
  let response = {
    status: 200,
    user_info: user_info,
  }
  return response;
}

method.getUserProfile = async function (_email,) {

  let user_data;
  try {

    await client.connect();

    const database = client.db("etsy_database");
    const users = database.collection("user_data");
    user_data = await users.findOne({ email: _email });
  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;

  } finally {

    await client.close();

  }
  var creation_date = null;
  if (user_data.creation_time) {
    // var utcSeconds = user_data.creation_time;
    creation_date = new Date(user_data.creation_time); // The 0 there is the key, which sets the date to the epoch
    // creation_date.setUTCSeconds(utcSeconds);
    // creation_date_string = creation_date.getFullYear() + "-" + (formatData(creation_date.getMonth() + 1)) + "-" + formatData(creation_date.getDate());
  }
  
  let response = {
    status: 200,
    user_info: {
      user_id: user_data.user,
      email: user_data.email,
      name: user_data.name,
      // is_subscribed: user_data.is_subscribed,
      contact_no: user_data.contact_no ? user_data.contact_no : null,
      country: user_data.country ? user_data.country : null,
      date_of_birth: user_data.date_of_birth ? user_data.date_of_birth : null,
      city: user_data.city ? user_data.city : null,
      street: user_data.street ? user_data.street : null,
      postal_code: user_data.postal_code ? user_data.postal_code : null,
      state: user_data.state ? user_data.state : null,
      creation_date: creation_date.toISOString(),
    }
  }
  return response;
}

method.getImage = async function (_email,) {

  let user_data;
  try {

    await client.connect();

    const database = client.db("etsy_database");
    const images = database.collection("image_storage");
    image_data = await images.findOne({ email: _email });
  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;

  } finally {

    await client.close();

  }
  let response = {
    status: 200,
    image_data: image_data,
  }
  return response;
}

method.updateCountry = async function (_email, _country,) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        country: _country,
        last_updated: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);

  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {

    await client.close();

  }
  let response = {
    status: 200,
    msg: "Country updated",
  }
  return response;
}


method.updateDateOfBirth = async function (_email, _date_of_birth) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        date_of_birth: _date_of_birth,
        last_updated: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);

  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {
    await client.close();
  }

  let response = {
    status: 200,
    msg: "Date of birth updated",
  }

  return response;
}


method.updateContactNo = async function (_email, _contact_no) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        contact_no: _contact_no,
        last_updated: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);

  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {

    await client.close();

  }

  let response = {
    status: 200,
    msg: "Contact number updated",
  }

  return response;
}

method.saveImage = async function (_email, _image) {
  if (!_image) {
    return response = {
      status: 200,
      msg: "image uploaded",
    };
  }
  try {

    await client.connect();
    var dbo = client.db("etsy_database");
    var query = { email: _email };
    var doc = {
      email: _email,
      file_path: _image.file_path,
    };
    await dbo.collection("image_storage").replaceOne(query, doc, { upsert: true });
  } catch (e) {
    console.log(e)
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {

    await client.close();

  }

  let response = {
    status: 200,
    msg: "image uploaded",
  }

  return response;
}



method.updateProfile = async function (_email, _name, _date_of_birth, _country, _contact_no,) {
  let message = "";
  try {
    
    await client.connect();
    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var updateQuery = {
      $set: {
      }
    };
    if (_date_of_birth) {
      updateQuery.$set['date_of_birth'] = _date_of_birth;
      message = message.concat("date of birth ,");
    }
    if (_country) {
      updateQuery.$set['country'] = _country;
      message = message.concat("country ,");
    }
    if (_contact_no) {
      updateQuery.$set['contact_no'] = _contact_no;
      message = message.concat("contact no ,");
    }
    if (_name) {
      updateQuery.$set['name'] = _name;
      message = message.concat("name ,")
    }
    if (message.length != 0) {
      message = message.substring(0, message.length - 1);
    }
    
    console.log(updateQuery);

    await dbo.collection("user_data").updateOne(myquery, updateQuery,);

  } catch (e) {
    console.log(e)
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {

    await client.close();
  }
  console.log(message)
  let response = {
    status: 200,
    msg: "Successfully updated",
  }

  return response;
}


method.deleteAccount = async function (_email,) {

  try {

    await client.connect();

    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    await dbo.collection("user_data").deleteOne(myquery,)


  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {
    await client.close();
  }

  let response = {
    status: 200,
    msg: "Successfully deleted",
  }
  return response;
}

method.saveStripeUser = async function(email, customer_id) {
  try {

    await client.connect();
    var dbo = client.db("etsy_database");
    var query = { email: email };
    var doc = {
      email: email,
      customer_id: customer_id,
    };
    await dbo.collection("stripe_data").replaceOne(query, doc, { upsert: true });
  } catch (e) {
    console.log(e)
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {

    await client.close();

  }

  let response = {
    status: 200,
    msg: "Stripe data created",
  }

  return response;
}




method.updateStripeSubscriptionIdAndStatus = async function( email, subscription_id, status) {
  try {

    await client.connect();
    var dbo = client.db("etsy_database");
    var query = { email: email };
    var doc = {
      $set: {
        subscription_id: subscription_id,
        status: status,
      }
    };
    await dbo.collection("stripe_data").updateOne(query, doc);
  } catch (e) {
    console.log(e)
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {

    await client.close();

  }

  let response = {
    status: 200,
    msg: "Stripe session updated",
  }

  return response;
}


method.updateStripeSubscriptionStatus = async function(customer_id, status) {
  try {

    await client.connect();
    var dbo = client.db("etsy_database");
    var query = { customer_id: customer_id };
    var doc = {
      $set: {
        status: status,
      }
    };
    await dbo.collection("stripe_data").updateOne(query, doc);
  } catch (e) {
    console.log(e)
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {

    await client.close();

  }
  let response = {
    status: 200,
    msg: "Status updated successfully",
  }
  return response;
}

method.getStripeData = async function (_email,) {

  let stripe_data;
  try {
    
    await client.connect();

    const database = client.db("etsy_database");
    const users = database.collection("stripe_data");
    stripe_data = await users.findOne({ email: _email });
    console.log(stripe_data)
  } catch (e) {
    let response = {
      status: 400,
      error_msg: e.message,
    }
    console.log(stripe_data)
    return response;

  } finally {

    await client.close();

  }
  let response = {
    status: 200,
    stripe_info: {
      email: stripe_data?stripe_data.email:null,
      customer_id: stripe_data?stripe_data.customer_id:null,
      subscription_id: stripe_data?stripe_data.subscription_id:null,
      status: stripe_data?stripe_data.status:null,
    } 
  }
  console.log(response)
  return response;
}

method.forgotPassword = async function (_email,) {

  let user_info;
  try {

    await client.connect();

    const database = client.db("etsy_database");
    const users = database.collection("user_data");
    const user_data = await users.findOne({ email: _email });
    if (user_data == null) {
      let  response = {
        status: 404,
        error_msg: "No user found",
      };
      return response;
    }
    var tokenGenerator = new GenerateToken();
    let response = tokenGenerator.getResetPasswordToken(_email);
    user_info = {
      access_token: response.access_token,
    }
    // console.log(user_info)
    var EmailHelper = require("./helper/email_helper.js");
    var john = new EmailHelper();
    // console.log(req.session);
    // console.log(req)

    var query = {
      email: _email,
    }
    const otpGenerated = generateOTP();
    var doc = {
      email: _email,
      reset_password: user_info.access_token,
      otp: otpGenerated,
      is_expired: "N",
    };
    const tokens = database.collection("user_tokens");

    await tokens.replaceOne(query, doc, { upsert: true });

    let link = "https://craftypro.co/auth/forgot-password?token=" + encodeURIComponent(user_info.access_token,true);
    link = link + "\n";
    link = link + "Otp: " + otpGenerated;

    console.log(link)
    response = await john.resetPasswordEmail(_email, link);

  } catch (e) {
    console.log(e)
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {
    await client.close();
  }
  let response = {
    status: 200,
    msg: "Email generated",
  }
  return response;
}


method.registerForNewsAndUpdates = async function (email,) {

  let user_info;
  try {

    await client.connect();
    var dbo = client.db("etsy_database");
    var query = { email: email };
    var doc = {
      email: email,
    };
    await dbo.collection("emails_data").replaceOne(query, doc, { upsert: true });

  } catch (e) {
    console.log(e)
    let response = {
      status: 400,
      error_msg: e.message,
    }
    return response;
  } finally {
    await client.close();
  }
  let response = {
    status: 200,
    msg: "Email registered",
  }
  return response;
}

const formatData =
    (input) => {
        if (input > 9) {
            return input;
        } else return `0${input}`;
    };

module.exports = LoginOrSignup;
