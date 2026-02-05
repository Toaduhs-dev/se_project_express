const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UNAUTHORIZED_ERROR_CODE } = require("../utils/errors");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(UNAUTHORIZED_ERROR_CODE)
      .send({ message: "Authorization Required" });
  }

  const token = authorization.replace("Bearer ", "");

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
    console.log("Decoded payload:", payload);
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res
      .status(UNAUTHORIZED_ERROR_CODE)
      .send({ message: "Invalid token" });
  }

  req.user = payload;
  console.log("Attached user to req:", req.user);

  return next();
};

module.exports = {
  auth,
};
