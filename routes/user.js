const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  getUsers,
  getCurrentUsers,
  updateProfile,
  createUser,
  loginUser,
} = require("../controllers/users");

router.get("/users", getUsers);

router.get("/users/me", auth, getCurrentUsers);

router.get("/users", auth, updateProfile);

router.get("/users", createUser);

router.get("/users", loginUser);

module.exports = router;
