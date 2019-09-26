const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");
const Event = require("../models/Event");

// get All users
router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await User.find().sort("-name");
    if (!users) {
      res
        .status(403)
        .render("404", {
          error: "Cannot access page. Page authorized for ADMINS only"
        });
    }

    res.status(200).render("users", { users });
  } catch (err) {
    res.status(401).render("not-found", { error: err.message });
  }
});

// get user
router.get("/users/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new Error();

    const events = await Event.find({ creator: user._id });
    res.status(200).render("user", { user, events });
  } catch (err) {
    res.status(404).render("not-found", { error: err.message });
  }
});

// delete user
router.delete("/users/:id", auth, admin, async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) {
      req.flash("danger", `${err.message}`);
      res
        .status(401)
        .render("not-found", { error: "User with given ID cannot be found" });
    }

    req.flash("primary", "User profile successfully deleted");
    res.status(200).redirect("back");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(404).render("not-found", { error: err.message });
  }
});

// get all events
router.get("/events", auth, admin, async (req, res) => {
  try {
    const events = await Event.find().sort("-createdAt");

    if (!events) {
      req.flash("danger", `${err.message}`);
      res.status(401).render("not-found", { error: "No events found" });
    }

    res.status(200).render("events", { events });
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).render("not-found", { error: err.message });
  }
});

module.exports = router;
