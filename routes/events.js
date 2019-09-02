const sharp = require("sharp");
const multer = require("multer");
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

    await req.user
      .populate({
        path: "events",
        options: { sort: { createdAt: -1 } }
      })
      .execPopulate();

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

// cover image
const coverImg = multer({
  options: {
    limits: 2000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)/))
      cb(new Error("File type must either be: JPG, JPEG, PNG or PDF"));

    cb(undefined, true);
  }
});

// create and update event's cover image
router.post(
  "/:id/coverImg",
  auth,
  coverImg.single("coverImg"),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .png()
        .resize({ width: 800, height: 640 })
        .toBuffer();
      req.event.coverImg = buffer;
      await req.event.save();
      res
        .status(201)
        .send({ success: "Cover image created/ updated successfully" });
    } catch (err) {
      res.status(400).send(err.message);
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// fetch events' cover image
router.get("/:id/coverImg", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.coverImg) throw new Error();

    res.set("Content-Type", "image/png");
    res.status(200).send();
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// delete event's cover image
router.delete("/:id/coverImg", async (req, res) => {
  try {
    req.event.coverImg = undefined;
    await req.event.save();
    res.status(200).send({ success: "Event cover image successfully deleted" });
  } catch (err) {
    res.status(400).send({ error: error.message });
  }
});

// update event
router.put("/", auth, async (req, res) => {
  const schema = {
    title: Joi.string(),
    venue: Joi.string(),
    eventDate: Joi.date().format("YYYY-MM-DD"),
    eventTime: Joi.string(),
    duration: Joi.number(),
    description: Joi.string()
  };

  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      req.body,
      { new: true }
    );
    res.status(200).send(event);
  } catch (err) {
    res.status(400).send("Event not updated");
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
