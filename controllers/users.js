const { response } = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const jwt = require("jsonwebtoken");

const {
  BAD_REQUEST_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  INTERNAL_SERVER_ERROR_CODE,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR_CODE)
        .send({ message: "An error has occurred on the server" });
    });
};

const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .orFail(() => {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError" || err.statusCode === 404) {
        return res.status(404).send({ message: "User not found" });
      }
      return res
        .status(500)
        .send({ message: "An error has occurred on the server" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        avatar,
        email: email.toLowerCase().trim(),
        password: hash,
      })
    )
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.status(201).send({
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        token,
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors)
          .map((e) => e.message)
          .join(", ");
        return res.status(400).send({ message: messages });
      }
      if (err.code === 11000) {
        return res
          .status(409)
          .send({ message: "A user with this email already exists" });
      }
      return res
        .status(500)
        .send({ message: "An error has occurred on the server" });
    });
};

const loginUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(BAD_REQUEST_ERROR_CODE).send({
      message: "Email and password are required",
    });
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        return res
          .status(UNAUTHORIZED_ERROR_CODE)
          .send({ message: "Incorrect email or password" });
      }
      return res.status(INTERNAL_SERVER_ERROR_CODE).send({
        message: "An error has occurred on the server",
      });
    });
};

const updateProfile = (req, res) => {
  const { name, avatar } = req.body;

  if (!name && !avatar) {
    return res.status(BAD_REQUEST_ERROR_CODE).send({
      message: "At least one field (name or avatar) must be provided",
    });
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (avatar) updateData.avatar = avatar;

  User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  })
    .orFail(() => {
      const error = new Error("User not found");
      error.statusCode = NOT_FOUND_ERROR_CODE;
      throw error;
    })
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);

      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors)
          .map((error) => error.message)
          .join(", ");
        return res.status(BAD_REQUEST_ERROR_CODE).send({ message: messages });
      }

      if (err.statusCode === NOT_FOUND_ERROR_CODE) {
        return res.status(NOT_FOUND_ERROR_CODE).send({ message: err.message });
      }

      return res
        .status(INTERNAL_SERVER_ERROR_CODE)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = {
  getUsers,
  getCurrentUser,
  createUser,
  loginUser,
  updateProfile,
};
