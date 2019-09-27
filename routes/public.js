const Joi = require("@hapi/joi");
const express = require("express");
const router = express.Router();

const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const Home = require("../models/Home");
const About = require("../models/About");

// register user
router.get("/register", async (req, res) => {
  try {
    res.status(200).render("register");
  } catch (err) {
    res.status(404).render({ error: "Page Not Found" });
  }
});

// login User
router.get("/login", (req, res) => {
  try {
    res.status(200).render("login");
  } catch (err) {
    res.status(404).render({ error: err.message });
  }
});

/*********************
 * Frontend Settings */

// Index
router.get("/", async (req, res) => {
  try {
    const content = await Home.find();
    if (!content) throw new Error("Insert new page content");

    res.status(200).render("index", { content });
  } catch (err) {
    res.status(404).send({ error: "Page Not Found" });
  }
});

// create home content
router.post("/", auth, admin, async (req, res) => {
  const schema = {
    content: Joi.string()
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) return req.flash("danger", `${error.details[0].message}`);

  try {
    const content = new Home(req.body);
    await content.save();

    req.flash("success", "Homepage content added");
    res.status(201).redirect("/");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// update home content
router.put("/:id", auth, admin, async (req, res) => {
  const schema = {
    content: Joi.string()
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) return req.flash("danger", `${error.details[0].message}`);

  try {
    const content = await Home.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    req.flash("success", "Homepage content updated");
    res.status(201).redirect("/");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// About
router.get("/about", async (req, res) => {
  try {
    const content = await About.find();
    if (!content) throw new Error("Insert new page content");

    res.status(200).render("about", { content });
  } catch (err) {
    res.status(404).render({ error: "Page Not Found" });
  }
});

// create about content
router.post("/about", auth, admin, async (req, res) => {
  const schema = {
    content: string()
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) return req.flash("danger", `${error.details[0].message}`);

  try {
    const content = new About(req.body);
    await content.save();

    req.flash("success", "About us page content added");
    res.status(201).redirect("/about");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

// update about content
router.put("/about:id", auth, admin, async (req, res) => {
  const schema = {
    content: Joi.string()
  };
  const { error } = Joi.validate(req.body, schema);
  if (error) return req.flash("danger", `${error.details[0].message}`);

  try {
    const content = await About.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );

    req.flash("success", "About us page content updated");
    res.status(201).redirect("/");
  } catch (err) {
    req.flash("danger", `${err.message}`);
    res.status(401).redirect("back");
  }
});

module.exports = router;
