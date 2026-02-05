const router = require("express").Router();
const { auth } = require("../middlewares/auth");

const {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
} = require("../controllers/clothingitems");

router.get("/", getClothingItems);
router.post("/", auth, createClothingItem); //add token
router.delete("/:id", auth, deleteClothingItem); //add token
router.put("/:id/likes", auth, likeClothingItem); //add token
router.delete("/:id/likes", auth, dislikeClothingItem); // add token

module.exports = router;
