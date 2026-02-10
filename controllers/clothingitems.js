const ClothingItem = require("../models/clothingitems");

const {
  BAD_REQUEST_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  INTERNAL_SERVER_ERROR_CODE,
  FORBIDDEN_ERROR_CODE,
} = require("../utils/errors");

const getClothingItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      return res
        .status(INTERNAL_SERVER_ERROR_CODE)
        .send({ message: "An error has occurred on the server" });
    });
};

const createClothingItem = (req, res) => {
  console.log(req.user);
  const owner = req.user._id;
  const { name, imageUrl, weather } = req.body;
  ClothingItem.create({
    name,
    imageUrl,
    weather,
    owner,
  })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({
          message: `${Object.values(err.errors)
            .map((error) => error.message)
            .join(", ")}`,
        });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server" });
      }
    });
};

const deleteClothingItem = (req, res) => {
  const { id } = req.params;
  ClothingItem.findById(id)
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NOT_FOUND_ERROR_CODE;
      throw error;
    })
    .then((item) => {
      if (!item.owner.equals(req.user._id)) {
        const err = new Error("You are not authorized to delete this item");
        err.statusCode = 403;
        throw err;
      }
      return ClothingItem.deleteOne({ _id: id }).then(() =>
        res.send({ message: "Item deleted successfully" }),
      );
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: "Invalid item ID" });
      } else if (err.statusCode === NOT_FOUND_ERROR_CODE) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: err.message });
      } else if (err.statusCode === 403) {
        res.status(403).send({ message: err.message });
      } else if (err.statusCode === FORBIDDEN_ERROR_CODE) {
        res.status(FORBIDDEN_ERROR_CODE).send({ message: err.message });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server" });
      }
    });
};

const updateLike = (req, res, method) => {
  const {
    params: { id },
  } = req;
  ClothingItem.findByIdAndUpdate(
    id,
    { [method]: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      const error = new Error("Item ID not found");
      error.statusCode = NOT_FOUND_ERROR_CODE;
      throw error;
    })
    .then((item) => {
      res.send(item);
    })
    .catch((err) => {
      console.error(err);

      if (err.name === "CastError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: "Invalid item ID" });
      } else if (err.statusCode === NOT_FOUND_ERROR_CODE) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: err.message });
      } else {
        res
          .status(INTERNAL_SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server" });
      }
    });
};

const likeClothingItem = (req, res) => updateLike(req, res, "$addToSet");

const dislikeClothingItem = (req, res) => updateLike(req, res, "$pull");

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
