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

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no Origin header (e.g., mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // Check if the requesting origin is in our allow list
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // Reflects the exact origin back
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Explicitly include OPTIONS for preflight
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],
  exposedHeaders: ["Content-Range", "X-Total-Count"], // Optional: if your API exposes custom headers
  credentials: true, // Allows cookies, auth headers, etc.
  optionsSuccessStatus: 200, // Some browsers/legacy clients prefer 200 over 204 for OPTIONS
  maxAge: 86400, // Cache preflight responses for 24 hours (optional, good for performance)
};

app.use(cors(corsOptions));
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
