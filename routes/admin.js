const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Event = require("../models/Event");
const Guest = require("../models/Guest");

// get All users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find().sort("name");
    if (!users) throw new Error();

    res.status(200).render("users", { users });
  } catch (err) {
    res.status(401).render({ error: err.message });
  }
});

// get user
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new Error();

    const events = await Event.find({ creator: user._id });
    res.status(200).render("user", { user, events });
  } catch (err) {
    res.status(404).render("not-found");
  }
});

module.exports = router;
