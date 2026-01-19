const router = require("express").Router();

const {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
} = require("../controllers/clothingitems");

router.get("/", getClothingItems);
router.post("/", createClothingItem);
router.delete("/:id", deleteClothingItem);
router.put("/:id/likes", likeClothingItem);
router.delete("/:id/likes", dislikeClothingItem);

module.exports = router;