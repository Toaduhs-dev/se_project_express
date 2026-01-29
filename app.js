require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRouter = require("./routes/index");

const app = express();

app.use(cors());
app.use(express.json());

const { MONGODB_URI = "mongodb://127.0.0.1:27017/wtwr_db" } = process.env;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((e) => {
    console.error("DB connection error:", e);
  });

const authMiddleware = (req, res, next) => {
  // Example: decoded token or fetched user
  const user = {
    _id: "64f9c2e1a3b4c5d6e7f8a9b0",
    name: "John Doe",
  };

  req.user = user;
  next();
};

app.use(authMiddleware);

app.use("/", mainRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Requested resource not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? "An error occurred on the server" : err.message,
  });
});

const { PORT = 3001 } = process.env;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
