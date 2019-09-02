const sharp = require("sharp");
const multer = require("multer");
const _ = require("lodash");
const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");
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
  if (error) return res.status(400).send(error.details[0].message);

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) res.status(401).send("Email already registered");

    user = new User(req.body);
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send("User not Registered");
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();

    // res.status(200).send({ user: _.pick(user, ["name", "email", "phone", "address", "company"]), token});
    res.status(200).send({ user, token });
  } catch (err) {
    res.status(400).send("Cannot login in User");
  }
});

// current user
router.get("/me", auth, (req, res) => {
  res.status(200).send(req.user);
});

// upload avatars
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/))
      cb(new Error("Image must be either be of type: JPG, JPEG, or PNG"));

    cb(undefined, true);
  }
});

// create and update avatar
router.post(
  "/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .png()
        .resize({ width: 200, height: 200 })
        .toBuffer();
      req.user.avatar = buffer;
      await req.user.save();
      res.status(201).send({ success: "Avatar created/ updated" });
    } catch (err) {
      res.status(401).send({ error: err.message });
    }
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

// fetch user's avatar
router.get(
  "/:id/avatar",
  async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user || !user.avatar) throw new Error();

      res.set("Content-Type", "image/png");
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
    res.status(201).send(user);
  } catch (err) {
    res.status(400).send("Cannot update User");
  }
});

// logout
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
    await req.user.save();
    res.status(200).send("User successfully logged out");
  } catch (err) {
    res.status(400).send("Cannot logout User");
  }
});

// logout from all sessions
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Successfully logged out from all devices");
  } catch (err) {
    res.status(400).send("Cannot logout User");
  }
});

// delete profile
router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.status(200).send(req.user);
  } catch (err) {
    res.status(400).send("Cannot delete User");
  }
});

module.exports = router;
