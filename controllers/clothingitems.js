const ClothingItem = require("../models/clothingitems");

const {
  BAD_REQUEST_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
  INTERNAL_SERVER_ERROR_CODE,
} = require("../utils/errors");

// GET /items
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

// POST /items
const createClothingItem = (req, res) => {
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
      // 400 — invalid data passed to the methods for creating a card/user or
      // updating a user's profile or avatar
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

// DELETE /items/:id
const deleteClothingItem = (req, res) => {
  const { id } = req.params;
  ClothingItem.findById(id)
    .orFail(() => {
      const error = new Error("Card ID not found");
      error.statusCode = NOT_FOUND_ERROR_CODE;
      throw error;
    })
    .then((item) => ClothingItem.deleteOne(item).then(() => res.send(item)))
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

const updateLike = (req, res, method) => {
  const {
    params: { id },
  } = req;
  // const method === req.method === 'PUT' ? '$addToSet' : '$pull'
  // When updating a user or items, `new: true` is passed to options.
  ClothingItem.findByIdAndUpdate(
    id,
    { [method]: { likes: req.user._id } },
    { new: true }
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
      // 400 — invalid data passed to the methods for creating an item/user or
      // updating a user's profile or avatar
      if (err.name === "CastError") {
        res.status(BAD_REQUEST_ERROR_CODE).send({ message: "Invalid item ID" });
        // 404 — there is no user or card with the requested id or
        // the request is sent to a non-existent address
      } else if (err.statusCode === NOT_FOUND_ERROR_CODE) {
        res.status(NOT_FOUND_ERROR_CODE).send({ message: err.message });
        // 500 — default error. Accompanied by the message: "An error has occurred on the server";
      } else {
        res
          .status(INTERNAL_SERVER_ERROR_CODE)
          .send({ message: "An error has occurred on the server" });
      }
    });
};

// PUT /items/:id/likes
const likeClothingItem = (req, res) => updateLike(req, res, "$addToSet");

// DELETE /items/:id/likes
const dislikeClothingItem = (req, res) => updateLike(req, res, "$pull");

module.exports = {
  getClothingItems,
  createClothingItem,
  deleteClothingItem,
  likeClothingItem,
  dislikeClothingItem,
};
