const express = require("express");
const router = express.Router();

const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Event = require("../models/Event");
const Guest = require("../models/Guest");

// Homepage
router.get("/", (req, res) => {
  try {
    res.status(200).render("index");
  } catch (err) {
    res.status(404).send({ error: "Page Not Found" });
  }
});

// About us
router.get("/about", (req, res) => {
  try {
    res.status(200).render("about");
  } catch (err) {
    res.status(404).render({ error: "Page Not Found" });
  }
});

// register user
router.get("/register", async (req, res) => {
  try {
    res.status(200).render("register");
  } catch (err) {
    res.status(404).render({ error: "Page Not Found" });
  }
});

// login User
router.get("/login", (req, res) => {
  try {
    res.status(200).render("login");
  } catch (err) {
    res.status(404).render({ error: err.message });
  }
});

// update user

/**************
 * Events
 *************/

// all events ---> admin only
router.get("/allevents", async (req, res) => {
  try {
    const events = await Event.find().sort("title");
    if (!events) throw new Error();

    res.status(200).render("events", { events });
  } catch (err) {
    res.status(404).render({ error: err.message });
  }
});

// get event ---> admin only
router.get("/event/:id", async (req, res) => {
  try {
    // const user = await User.findOne({ creator: })

    const event = await Event.findById(req.params.id);
    if (!event) throw new Error();
    res.status(200).render({ event });
  } catch (err) {
    res.status(401).render({ error: err.message });
  }
});

module.exports = router;
