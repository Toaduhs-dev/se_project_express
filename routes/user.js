const router = require("express").Router();
const { auth } = require("../middlewares/auth");

const {
  getUsers,
  getCurrentUser,
  updateProfile,
  createUser,
  loginUser,
} = require("../controllers/users");

router.get("/", getUsers);

router.get("/me", auth, getCurrentUser);

router.patch("/me", auth, updateProfile);

module.exports = router;
