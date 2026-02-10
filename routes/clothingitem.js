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
router.post("/", auth, createClothingItem);
router.delete("/:id", auth, deleteClothingItem);
router.put("/:id/likes", auth, likeClothingItem);
router.delete("/:id/likes", auth, dislikeClothingItem);

module.exports = router;
