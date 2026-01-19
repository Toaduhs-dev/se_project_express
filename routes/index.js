const router = require("express").Router();

const userRouter = require("./user");

const itemsRouter = require("./clothingitem.js");

router.use("/users", userRouter);

router.use("/items", itemsRouter);

module.exports = router;
