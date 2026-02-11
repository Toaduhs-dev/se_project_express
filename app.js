require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRouter = require("./routes/index");

const app = express();

const allowedOrigins = [
  "http://18.222.217.216:80", // without trailing slash (common referrer)
  "http://18.222.217.216/", // with trailing slash (if your code uses it)
  "http://localhost:3000", // if your local frontend runs on 3000
  "http://localhost:5173", // common for Vite/React dev
  "http://localhost:80",
  "http://localhost",
];

app.use(cors("*"));
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
