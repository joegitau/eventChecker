const bodyParser = require("body-parser");
const sharp = require("sharp");
const multer = require("multer");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const express = require("express");

const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const auth = require("../middleware/auth");
const User = require("../models/User");
const Event = require("../models/Event");

const { sendWelcomeEmail, sendDeleteEmail } = require("../emails/account");

// register
router.post("/register", urlencodedParser, async (req, res) => {
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
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) res.status(401).send("Email already registered");

    user = new User(req.body);
    await user.save();

    sendWelcomeEmail(user.email, user.name);

    const token = await user.generateAuthToken();

    // res.status(201).send({ user, token });
    res.status(201).redirect("/login");
  } catch (err) {
    res.status(401).send({ error: err.message });
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
router.post("/login", urlencodedParser, async (req, res) => {
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
      // .send({ user, token })
      .redirect("/users/me");
  } catch (err) {
    res.status(401).send({ error: err.message });
  }
});

// current user
router.get("/me", auth, async (req, res) => {
  try {
    const events = await Event.find({ creator: req.user._id });

    const allUsers = await User.find().sort("name");

    res.status(200).render("user", { user: req.user, events, allUsers });
    // res.status(200).send(req.user);
  } catch (err) {
    res.status(404).render("not-found");
  }
});

// create new event
router.get("/me/new-event", auth, async (req, res) => {
  try {
    res.status(200).render("new-event");
  } catch (err) {
    res.status(401).render({ error: err.message });
  }
});

// upload avatars
// storage
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     // user-id-date.ext
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

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
      // const buffer = await sharp(req.file.buffer)
      //   .png()
      //   .resize({ width: 400, height: 400 })
      //   .toBuffer();
      // req.user.avatar = buffer;

      req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

      sharp(req.file.buffer)
        .resize(400, 400)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

      req.user.avatar = req.file.filename;

      await req.user.save();

      // res.status(201).send({ success: "Image profile added/ updated" });
      res.status(201).redirect("/users/me");
    } catch (err) {
      res.status(401).send({ error: err.message });
    }
  },
  (error, req, res, next) => {
    res.status(401).send({ error: error.message });
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
      res.status(400).send({ error: error.message });
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete("/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send({ success: "Avatar successfully removed" });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// update user
router.put("/me", [urlencodedParser, auth], async (req, res) => {
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
    res.status(201).redirect("/me");
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// logout
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
    await req.user.save();
    res.status(200).redirect("/");
  } catch (err) {
    res.status(400).render({ error: err.message });
  }
});

// logout from all sessions
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).redirect("/");
  } catch (err) {
    res.status(400).render({ error: err.message });
  }
});

// delete profile
router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();

    sendDeleteEmail(req.user.email, req.user.name);

    // res.status(200).send(req.user);
    res.status(200).redirect("/");
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

module.exports = router;
