const router = require("express").Router();

const userRouter = require("./user");
const itemsRouter = require("./clothingitem.js");
//const { signup, signin } = require("../middlewares/auth");
const { createUser, loginUser } = require("../controllers/users.js");
// Public auth routes
router.post("/signup", createUser);
router.post("/signin", loginUser);

router.use("/users", userRouter);
router.use("/items", itemsRouter);

module.exports = router;
