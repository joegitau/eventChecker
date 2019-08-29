const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event");

async function auth(req, res, next) {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, "jwtPrivateKey");

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    }); // finds _id from decoded payload
    if (!user) throw new Error();

    const event = await Event.findOne({ creator: user._id });

    req.event = event;
    req.token = token;
    req.user = user;

    next();
  } catch (err) {
    res.status(403).send("user Not Authorized.");
  }
}

module.exports = auth;
