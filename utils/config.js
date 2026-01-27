require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "you can't see my secret :D";

module.exports = {
  JWT_SECRET,
};
