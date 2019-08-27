const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
Joi.objectId = require("joi-objectid")(Joi);
const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const User = require("../models/User");

// create event
router.post("/", async (req, res) => {
  const schema = {
    title: Joi.string().required(),
    venue: Joi.string().required(),
    eventDate: Joi.date()
      .format("YYYY-MM-DD")
      .required(),
    eventTime: Joi.string().required(),
    duration: Joi.number().required(),
    description: Joi.string(),
    creator: Joi.objectId().required()
  };

  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const event = new Event(req.body);

    // const event = new Event({
    //   ...req.body,
    //   creator: req.user_id
    // });
    await event.save();
    res.status(201).send(event);
  } catch (err) {
    res.status(400).send("Event not created");
  }
});

// fetch user's events
router.get("/", async (req, res) => {
  try {
    const user = await User.findOne({ creator: req.body._id });

    const events = await Event.find()
      .populate("user")
      .execPopulate();
    res.status(200).send(events);
  } catch (err) {
    res.status(400).send("Events not found");
  }
});

module.exports = router;
