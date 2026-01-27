const router = require("express").Router();
const auth = require("../middlewares/auth");

const {
  getUsers,
  getCurrentUser,
  updateProfile,
  createUser,
  loginUser,
} = require("../controllers/users");

router.post("/signup", createUser);
router.post("/signin", loginUser);

router.get("/users", getUsers);

router.get("/users/me", auth, getCurrentUser);

router.patch("/users/me", auth, updateProfile);

module.exports = router;
