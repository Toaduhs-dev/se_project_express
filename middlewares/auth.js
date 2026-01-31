const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UNAUTHORIZED_ERROR_CODE } = require("../utils/errors");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

const auth = (req, res, next) => {
  // const token = req.cookies.jwt;
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    res
      .status(UNAUTHORIZED_ERROR_CODE)
      .send({ message: "Authorization Required" });
  }

  const token = authorization.replace("Bearer ", "");
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error(err);
    return res
      .status(UNAUTHORIZED_ERROR_CODE)
      .send({ message: "Authorization Required" });
  }

  req.user = payload;

  return next();
};

// User Registration
const signup = async (req, res, next) => {
  try {
    const { name, avatar, email, password } = req.body;
    if (!name || !avatar || !email || !password) {
      return res.status(400).send({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).send({ message: "User already exists" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, avatar, email, password: hash });
    res.status(201).send({
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      _id: user._id,
    });
  } catch (err) {
    next(err);
  }
};

// User Authorization
const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).send({ message: "Incorrect email or password" });
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.status(401).send({ message: "Incorrect email or password" });
    }
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.send({ token });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  auth,
  signup,
  signin,
};
