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
const Guest = require("../models/Guest");

// create event
router.post("/", auth, async (req, res) => {
  const schema = {
    title: Joi.string()
      .required()
      .error(errors => new Error("Title field is required")),
    venue: Joi.string()
      .required()
      .error(errors => new Error("Venue field is required")),
    eventDate: Joi.date()
      .required()
      .format("DD.MM.YYYY")
      .error(errors => new Error("Date field is required")),
    eventTime: Joi.string()
      .required()
      .error(errors => new Error("Event Time field is required")),
    address: Joi.string(),
    duration: Joi.number()
      .required()
      .error(errors => new Error("Event Duration field is required")),
    description: Joi.string()
  };

  const { error } = Joi.validate(req.body, schema);

  if (error) return req.flash("danger", `${error.details[0].message}`);

  try {
    const event = new Event({
      ...req.body,
      creator: req.user._id
    });

    await event.save();

    req.flash("success", "Event successfully added.");
    res.status(201).redirect("/events");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
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

    res.status(200).render("events", { events: req.user.events });
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(400).render("not-found", { error: err.message });
  }
});

// fetch single user event
router.get("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      creator: req.user._id
    });
    if (!event) {
      req.flash("danger", "Event with given ID cannot be found");
      return res.status(400).redirect("back");
    }

    const guests = await Guest.find({ eventId: event._id }).sort("-name");

    res.status(200).render("event", { event, guests });
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).render("not-found", { error: err.message });
  }
});

// render new guest
router.get("/:id/new-guest", auth, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user._id }).sort(
      "createdAt"
    );

    const event = await Event.findOne({ _id: req.params.id });
    res.status(200).render("new-guest", { event, events });
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(400).render("not-found", { error: err.message });
  }
});

// fetch guest
router.get("/:id/guest/:guestId", auth, async (req, res) => {
  try {
    const user = req.user;
    const event = await Event.findOne({ _id: req.params.id });

    const guest = await Guest.findOne({
      _id: req.params.guestId,
      eventId: req.params.id
    });

    if (!guest) {
      req.flash("danger", "Guest with given ID cannot be found");
      return res.redirect("back");
    }

    res.status(200).render("guest", { guest, event, user });
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(400).render("not-found", { error: err.message });
  }
});

// update guest
router.put("/:id/guest/:guestId", auth, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id });

    const guest = await Guest.findOneAndUpdate(
      {
        _id: req.params.guestId,
        eventId: req.params.id
      },
      req.body,
      { new: true }
    );

    req.flash("success", "Guest successfully updated.");
    res.status(200).redirect("back");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(400).render("not-found", { error: err.message });
  }
});

// delete guest
router.delete("/:id/guest/:guestId", auth, async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id });

    const guest = await Guest.findOneAndDelete({
      _id: req.params.guestId,
      eventId: req.params.id
    });

    if (!guest) {
      req.flash("danger", "Guest with given ID cannot be found");
      return res.status(401).redirect("back");
    }

    req.flash("success", "Guest successfully deleted.");
    res.status(200).redirect("back");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(400).render("not-found", { error: err.message });
  }
});

// cover image
// strorage
const multerStorage = multer.memoryStorage();

// filters
const multerFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
    cb(new Error("Image must be either be of type: JPG, JPEG, or PNG"));

  cb(undefined, true);
};

const coverImg = multer({
  limits: { fileSize: 2000000 },
  storage: multerStorage,
  fileFilter: multerFilter
});

// render upload and update page
router.get("/:id/update-event", auth, async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!event) {
      req.flash("danger", "Event with given ID cannot be found");
      return res.status(401).redirect("back");
    }

    res.status(200).render("update-event", { event });
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

// create and update event's cover image
router.post(
  "/:id/coverImg",
  auth,
  coverImg.single("coverImg"),
  async (req, res) => {
    try {
      req.file.filename = `event-${req.event.id}-${Date.now()}.jpeg`;

      sharp(req.file.buffer)
        .resize(800, 800)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/events/${req.file.filename}`);

      req.event.coverImg = req.file.filename;

      await req.event.save();

      req.flash("success", "Event Cover Image added.");
      res.status(201).redirect("back");
    } catch (err) {
      req.flash("danger", `${err.message}`);
      res.status(400).redirect("back");
    }
  },
  (error, req, res, next) => {
    req.flash("danger", `${error.message}`);
    res.status(400).redirect("back");
  }
);

// fetch events' cover image
router.get("/:id/coverImg", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event || !event.coverImg) throw new Error();

    res.set("Content-Type", "image/jpeg");

    res.status(200).send();
  } catch (err) {
    req.flash("danger", `${error.message}`);
    res.status(400).render("not-found", { error: err.message });
  }
});

// delete event's cover image
router.delete("/:id/coverImg", async (req, res) => {
  try {
    req.event.coverImg = undefined;
    await req.event.save();

    req.flash("success", "Event Cover image deleted.");
    res.status(200).redirect("/events");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(400).render("not-found", { error: err.message });
  }
});

// update event
router.put("/:id", auth, async (req, res) => {
  const schema = {
    title: Joi.string(),
    venue: Joi.string(),
    eventDate: Joi.date().format("DD.MM.YYYY"),
    eventTime: Joi.string(),
    address: Joi.string(),
    duration: Joi.number(),
    description: Joi.string()
  };

  const { error } = Joi.validate(req.body, schema);
  if (error) return req.flash("danger", `${error.details[0].message}`);

  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      req.body,
      { new: true }
    );

    req.flash("success", "Event successfully updated.");
    res.status(201).redirect("back");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// delete event
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findOneAndRemove({
      _id: req.params.id,
      creator: req.user._id
    });

    if (!event) {
      req.flash("danger", "Event with given ID cannot be found");
      return res.status(401).redirect("back");
    }

    req.flash("success", "Event successfully deleted.");
    res.status(200).redirect("back");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

module.exports = router;
