const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
Joi.objectId = require("joi-objectid")(Joi);
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Event = require("../models/Event");
const User = require("../models/User");

// create event
router.post("/", auth, async (req, res) => {
  const schema = {
    title: Joi.string().required(),
    venue: Joi.string().required(),
    eventDate: Joi.date()
      .format("YYYY-MM-DD")
      .required(),
    eventTime: Joi.string().required(),
    duration: Joi.number().required(),
    description: Joi.string()
  };

  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const event = new Event({
      ...req.body,
      creator: req.user._id
    });
    await event.save();
    res.status(201).send(event);
  } catch (err) {
    res.status(400).send("Event not created");
  }
});

// fetch all user's events
router.get("/", auth, async (req, res) => {
  try {
    // const events = await Event.find({ creator: req.user._id });
    // res.status(200).send(events);

    await req.user.populate("events").execPopulate();
    res.status(200).send(req.user.events);
  } catch (err) {
    res.status(400).send("Events not found");
  }
});

// fetch single user event
router.get("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      creator: req.user._id
    });
    if (!event) return res.status(400).send("Event with given ID not found");
    res.status(200).send(event);
  } catch (err) {
    res.status(400).send("Event not found");
  }
});

// delete event
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findOneAndRemove({
      _id: req.params.id,
      creator: req.user._id
    });
    if (!event) return res.status(400).send("Event with given ID not found");
    res.status(200).send(event);
  } catch (err) {
    res.status(400).send("Event not deleted");
  }
});

module.exports = router;
