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


method.saveUser = async function (_email, _password, _is_subscribed, _country, _name) {
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
      is_subscribed: _is_subscribed,
      last_updated: null,
      expiry: Date.now() + 2592000,
      subscribed_date: Date.now()
    };
    const result = await collection.insertOne(doc);

    console.log(`A document was inserted with the _id: ${result.insertedId}`);
    insert_id = result.insertedId;
  } catch (e) {
    console.log(e)
    if (e.code === 11000) {
      let response = {
        status: 500,
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
      status: 500,
      error_msg: e,
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

method.updateSubscription = async function (_email, _is_subscribed) {
  try {
    await client.connect();
    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var newvalues = {
      $set: {
        is_subscribed: _is_subscribed,
        last_updated: Date.now(),
        subscribed_date: Date.now()
      }
    };
    await dbo.collection("user_data").updateOne(myquery, newvalues);
  } catch (e) {
    let response = {
      status: 500,
      error_msg: e,
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
      status: 500,
      error_msg: e,
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
      status: 500,
      error_msg: e,
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
        error_msg: "no user found",
      }
    }
    if (user_data.password == _password) {
      response = tokenGenerator.getToken(_email);
    }

    user_info = {
      email: user_data.email,
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      name: user_data.name,
      user_id: user_data.user,
      is_subscribed: user_data.is_subscribed,
      contact_no: user_data.contact_no ? user_data.contact_no : null,
      country: user_data.country ? user_data.country : null,
      date_of_birth: user_data.date_of_birth ? user_data.date_of_birth : null,
    }
    console.log(user_info)
  } catch (e) {
    let response = {
      status: 500,
      error_msg: e,
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
      status: 500,
      error_msg: e,
    }
    return response;

  } finally {

    await client.close();

  }
  let response = {
    status: 200,
    user_info: {
      user_id: user_data.user,
      email: user_data.email,
      name: user_data.name,
      is_subscribed: user_data.is_subscribed,
      contact_no: user_data.contact_no ? user_data.contact_no : null,
      country: user_data.country ? user_data.country : null,
      date_of_birth: user_data.date_of_birth ? user_data.date_of_birth : null,
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
      status: 500,
      error_msg: e,
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
      status: 500,
      error_msg: e,
    }
    return response;
  } finally {

    await client.close();

  }
  let response = {
    status: 200,
    msg: "country updated",
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
      status: 500,
      error_msg: e,
    }
    return response;
  } finally {

    await client.close();

  }

  let response = {
    status: 200,
    msg: "date of birth updated",
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
      status: 500,
      error_msg: e,
    }
    return response;
  } finally {

    await client.close();

  }

  let response = {
    status: 200,
    msg: "contact no updated",
  }

  return response;
}

method.saveImage = async function (_email, _image) {
  if (!_image) {
    return response = {
      status: 200,
      msg: "image_uploaded",
    };
  }
  try {

    await client.connect();
    var dbo = client.db("etsy_database");
    var query = { email: _email };
    var doc = {
      email: _email,
      image_name: _image.name,
      image_desc: _image.desc,
      file_path: _image.file_path,
    };
    await dbo.collection("image_storage").replaceOne(query, doc, { upsert: true });
  } catch (e) {
    console.log(e)
    let response = {
      status: 500,
      error_msg: e,
    }
    return response;
  } finally {

    await client.close();

  }

  let response = {
    status: 200,
    msg: "image_uploaded",
  }

  return response;
}



method.updateProfile = async function (_email, _name, _date_of_birth, _country, _contact_no,) {

  try {

    await client.connect();
    var dbo = client.db("etsy_database");
    var myquery = { email: _email };
    var updateQuery = {
      $set: {
      }
    };
    if (_date_of_birth)
      updateQuery.$set['date_of_birth'] = _date_of_birth;
    if (_country)
      updateQuery.$set['country'] = _country;
    if (_contact_no)
      updateQuery.$set['contact_no'] = _contact_no;
    if (_name)
      updateQuery.$set['name'] = _name;

    console.log(updateQuery);

    await dbo.collection("user_data").updateOne(myquery, updateQuery,);

  } catch (e) {
    console.log(e)
    let response = {
      status: 500,
      error_msg: e,
    }
    return response;
  } finally {

    await client.close();
  }

  let response = {
    status: 200,
    msg: "contact no updated",
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
      status: 500,
      error_msg: e,
    }
    return response;
  } finally {
    await client.close();
  }

  let response = {
    status: 200,
    msg: "deleted",
  }
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
      return "No user found";
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

    let link = "https://eprimedata.com/reset-password?token=" + encodeURIComponent(user_info.access_token);
    link = link + "\n";
    link = link + "Otp: " + otpGenerated;

    console.log(link)
    response = await john.resetPasswordEmail(_email, link);

  } catch (e) {
    console.log(e)
    let response = {
      status: 500,
      error_msg: e,
    }
    return response;
  } finally {
    await client.close();
  }
  let response = {
    status: 200,
    msg: "email generated",
  }
  return response;
}

module.exports = LoginOrSignup;