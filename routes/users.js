const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const User = require("../models/User");

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
    company: Joi.string()
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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (err) {
    res.status(400).send("Cannot login in User");
  }
});

// profile
router.get("/me", auth, async (req, res) => {
  res.status(200).send(req.user);
});

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(t => t.token !== req.token);
    await req.user.save();
    res.status(200).send("User successfully logged out");
  } catch (err) {
    res.status(400).send("Cannot logout User");
  }
});

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Successfully logged out from all devices");
  } catch (err) {
    res.status(400).send("Cannot logout User");
  }
});

module.exports = router;
