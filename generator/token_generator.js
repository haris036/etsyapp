const jwt = require("jsonwebtoken");
// var method = TokenGenerator.prototype;
// function TokenGenerator() { };
// const config = process.env;


var method = GenerateToken.prototype;

function GenerateToken() { }
method.getToken =  function (user_id) {
    console.log(user_id)
    let response = {
        access_token: generateAccessToken(user_id, "Takasssshi", "15m"),
        refresh_token:  generateAccessToken(user_id, "TakasssshiR", "20m"),
    };
    return response;
}

method.getResetPasswordToken =  function (user_id) {
    let response = {
        access_token: generateAccessToken(user_id, "Charger", "60m"),
    };
    return response;
}

method.getVerifiedOtpToken =  function (user_id) {
    console.log(user_id)
    let response = {
        access_token: generateAccessToken(user_id,"Wire", "15m"),
    };
    return response;
}

function generateAccessToken(user, key, time) {
    return jwt.sign({user}, key, { expiresIn: time });
}



module.exports = GenerateToken;
