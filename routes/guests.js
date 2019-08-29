const BaseJoi = require("@hapi/joi");
const Extension = require("@hapi/joi-date");
const Joi = BaseJoi.extend(Extension);
Joi.objectId = require("joi-objectid")(Joi);
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const Guest = require("../models/Guest");
const Event = require("../models/Event");

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
    eventId: Joi.objectId()
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const event = await Event.findById(req.event._id);
    const guest = new Guest({ ...req.body, eventId: event });

    await guest.save();
    res.status(201).send(guest);
  } catch (err) {
    res.status(401).send("Guest not created");
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const guest = await Guest.findOne({
      _id: req.params.id
    }).populate("eventId");
    if (!guest) return res.status(400).send("Guest with given ID not found");
    res.status(200).send(guest);
  } catch (err) {
    res.status(401).send("Guest not found");
  }
});

module.exports = router;
