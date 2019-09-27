const mongoose = require("mongoose");

const homeSchema = new mongoose.Schema(
  {
    content: String
  },
  { timestamps: true }
);

const Home = mongoose.model("Home", homeSchema);

module.exports = Home;
