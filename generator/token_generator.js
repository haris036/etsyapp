const jwt = require("jsonwebtoken");
// var method = TokenGenerator.prototype;
// function TokenGenerator() { };
// const config = process.env;


var method = GenerateToken.prototype;

function GenerateToken() { }
method.getToken =  function (user_id) {
    console.log(user_id)
    let response = {
        access_token: generateAccessToken(user_id, "15m"),
        refresh_token: generateRefreshToken(user_id)
    };
    return response;
}

method.getResetPasswordToken =  function (user_id) {
    console.log(user_id)
    let response = {
        access_token: generateAccessToken(user_id, "60m"),
    };
    return response;
}

function generateAccessToken(user, time) {
    return jwt.sign({user}, "Haris", { expiresIn: time });
}

function generateRefreshToken(user) {
    const refreshToken =
        jwt.sign({user}, "Haris", { expiresIn: "20m" });
    return refreshToken
}


module.exports = GenerateToken;