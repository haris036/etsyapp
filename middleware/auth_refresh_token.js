const jwt = require("jsonwebtoken");

const verifyRefreshToken = (req, res, next) => {
  
  const token =
    req.headers["x-access-refresh-token"];

  if (!token) {
    return res.status(403).send("A refresh token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token,"Haris");
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Refresh Token");
  }
  return next();
};


module.exports = verifyRefreshToken;