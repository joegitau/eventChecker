const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
Joi.objectId = require("joi-objectid")(Joi);
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const Guest = require("../models/Guest");
const Event = require("../models/Event");

// create guest
router.post("/", auth, async function(req, res) {
  const schema = {
    name: Joi.string().required(),
    email: Joi.string()
      .required()
      .email(),
    phone: Joi.string()
      .min(7)
      .max(15),
    address: Joi.string(),
    company: Joi.string(),
    eventId: Joi.objectId(),
    isVip: Joi.string(),
    isArrived: Joi.string()
  };
  const { error } = Joi.validate(req.body, schema);
  // if (error) return res.status(400).send(error.details[0].message);
  if (error) return req.flash("danger", `${error.details[0].message}`);

  try {
    const event = await Event.findById(req.body.eventId);
    if (!event) return res.status(400).send("Invalid Event");
    const guest = new Guest({ ...req.body, eventId: event._id });

    await guest.save();

    req.flash("primary", "Guest successfully added.");
    res.status(201).redirect("/events");
  } catch (err) {
    console.log(err.message);
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// get guest
router.get("/:id", auth, async (req, res) => {
  try {
    const guests = await Guest.find({ eventId: req.event._id }).sort("-name");

    const guest = await Guest.findOne({
      _id: req.params.id
    }).populate(
      "eventId",
      "title venue eventDate eventTime duration capacity -_id"
    );
    if (!guest) {
      req.flash("danger", "Guest with given ID cannot be found");
      return res.status(400).redirect("back");
    }

    res.status(200).render("guest", { guest, guests });
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).render("not-found", { error: err.message });
  }
});

// filter guests depending on arrival status
router.get("/", auth, async (req, res) => {
  const match = {};
  if (req.query.isArrived) {
    match.isArrived = req.query.isArrived === "true";
  }
  try {
    await req.event
      .populate({
        path: "guests",
        match,
        options: {
          limit: parseInt(req.query.limit),
          limit: parseInt(req.query.skip),
          sort: { name: 1 }
        }
      })
      .execPopulate();
    res.send(req.event.guests);
  } catch (err) {
    res.status(401).send("Guests not found");
  }
});

module.exports = router;
