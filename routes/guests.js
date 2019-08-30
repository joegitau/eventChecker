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
    eventId: Joi.objectId(),
    isArrived: Joi.boolean()
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const event = await Event.findById(req.body.eventId);
    if (!event) return res.status(400).send("Invalid Event");
    const guest = new Guest({ ...req.body, eventId: event._id });

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
    }).populate(
      "eventId",
      "title venue eventDate eventTime duration capacity -_id"
    );
    if (!guest) return res.status(400).send("Guest with given ID not found");
    res.status(200).send(guest);
  } catch (err) {
    res.status(401).send("Guest not found");
  }
});

// fetch all guests
// router.get("/", auth, async (req, res) => {
//   try {
//     await req.event.populate("guests").execPopulate();
//     res.send(req.event.guests);
//   } catch (err) {
//     res.status(401).send("No Guests found");
//   }
// });

// filter guests depending on arrival status
router.get("/", auth, async (req, res) => {
  const match = {};
  if (req.query.isArrived) {
    match.isArrived = req.query.isArrived === "true";
  }
  try {
    await req.event.populate({ path: "guests", match }).execPopulate();
    res.send(req.event.guests);
  } catch (err) {
    res.status(401).send("Guests not found");
  }
});

module.exports = router;
