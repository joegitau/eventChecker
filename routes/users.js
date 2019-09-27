const sharp = require("sharp");
const multer = require("multer");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");
const Event = require("../models/Event");
const Home = require("../models/Home");
const About = require("../models/About");

const { sendWelcomeEmail, sendDeleteEmail } = require("../emails/account");

// register
router.post("/register", async (req, res) => {
  const schema = {
    name: Joi.string().required(),
    email: Joi.string()
      .required()
      .email(),
    password: Joi.string()
      .required()
      .min(4),
    phone: Joi.string()
      .min(7)
      .max(15),
    address: Joi.string(),
    company: Joi.string(),
    isAdmin: Joi.boolean()
  };
  const { error } = Joi.validate(req.body, schema);
  // if (error) return res.status(400).send(error.details[0].message);
  if (error) return req.flash("danger", `${error.details[0].message}`);

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) req.flash("danger", "Email already exists.");

    user = new User(req.body);
    await user.save();

    sendWelcomeEmail(user.email, user.name);

    const token = await user.generateAuthToken();

    req.flash("success", "User profile successfully created. Please Login.");
    res.status(201).redirect("/login");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// handle preflight request on the login POST route (cors)
router.options("/*", (req, res) => {
  res.header("access-control-allow-origin", "*");
  res.header("access-control-allow-methods", "POST");
  res.header(
    "access-control-allow-headers",
    " Accept, access-control-allow-origin, Content-Type"
  );
  res.sendStatus(204);
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);

    const token = await user.generateAuthToken();

    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.AUTH_TOKEN_EXPIRY_DATE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };

    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res
      .cookie("Authorization", "Bearer " + token, cookieOptions)
      .status(200)
      .redirect("/users/me");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// current user
router.get("/me", auth, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user._id });

    const allEvents = await Event.find().sort("-createdAt");

    const allUsers = await User.find().sort("-name");

    const homeContent = await Home.find();
    const aboutContent = await About.find();

    if (!req.user) {
      req.flash("danger", "Please login");
      req.status(404).render("not-found", { error: "Please login" });
    }

    res
      .status(200)
      .render("user", {
        user: req.user,
        events,
        allUsers,
        allEvents,
        homeContent,
        aboutContent
      });
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).render("not-found", { error: err.message });
  }
});

// render new event view page
router.get("/me/new-event", auth, async (req, res) => {
  try {
    res.status(200).render("new-event");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).render("not-found", { error: err.message });
  }
});

const multerStorage = multer.memoryStorage();

// filters
const multerFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
    cb(new Error("Image must be either be of type: JPG, JPEG, or PNG"));

  cb(undefined, true);
};

const upload = multer({
  limits: { fileSize: 1000000 },
  storage: multerStorage,
  fileFilter: multerFilter
});

// create and update avatar
router.post(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

      sharp(req.file.buffer)
        .resize(400, 400)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

      req.user.avatar = req.file.filename;

      await req.user.save();

      req.flash("success", "Profile image successfully added.");
      res.status(201).redirect("/users/me");
    } catch (err) {
      req.flash("danger", `${err.message}`);
      res.status(401).redirect("back");
    }
  },
  (error, req, res, next) => {
    req.flash("danger", `${err.message}`);
    res.status(401).render("not-found", { error: error.message });
  }
);

// fetch user's avatar
router.get(
  "/:id/avatar",
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user || !user.avatar) throw new Error();

      res.set("Content-Type", "image/jpeg");
      res.send(user.avatar);
    } catch (err) {
      req.flash("danger", `${err.message}`);
      res.status(401).render("not-found", { error: err.message });
    }
  },
  (error, req, res, next) => {
    req.flash("danger", `${err.message}`);
    res.status(400).render("not-found", { error: error.message });
  }
);

router.delete("/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();

    req.flash("success", "Profile image successfully deleted");
    res.status(200).redirect("back");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// update user
router.put("/me", auth, async (req, res) => {
  const schema = {
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(4),
    phone: Joi.string()
      .min(7)
      .max(15),
    address: Joi.string(),
    company: Joi.string()
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const user = await User.findOneAndUpdate({ _id: req.user._id }, req.body, {
      new: true
    });
    await user.save();

    req.flash("success", "User successfully updated.");
    res.status(201).redirect("back");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// logout
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
    await req.user.save();

    res.status(200).redirect("/");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// logout from all sessions
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.status(200).redirect("/");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// delete profile
router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();

    sendDeleteEmail(req.user.email, req.user.name);

    req.flash("success", "Profile successfully deleted.");
    res.status(200).redirect("/");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// router.delete("/:userId", auth, async (req, res) => {
//   try {
//     const user_id = req.params.userId;

//     const user = await User.deleteOne({ _id: user_id, userId: req.user._id });

//     res.status().json({ success: "user successfully deleted" });
//   } catch (err) {
//     res.status(401).render("not-found", { error: err.message });
//   }
//   const user_id = req.params.userId;
// });

module.exports = router;
