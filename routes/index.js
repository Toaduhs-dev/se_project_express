const router = require("express").Router();


const userRouter = require("./user");
const itemsRouter = require("./clothingitem.js");
const { signup, signin } = require("../middlewares/auth");

// Public auth routes
router.post("/signup", signup);
router.post("/signin", signin);

router.use("/users", userRouter);
router.use("/items", itemsRouter);

module.exports = router;
