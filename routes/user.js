const router = require("express").Router();

router.get("/users", () => console.log("GET users"));
router.get("/:userId", () => console.log("GET users by ID"));
router.get("/", () => console.log("POST users"));

module.exports = router;
