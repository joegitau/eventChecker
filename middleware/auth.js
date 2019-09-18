const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Event = require("../models/Event");

async function auth(req, res, next) {
  try {
    console.log(req.cookies.authorization);
    // const token = req.header("Authorization").replace("Bearer ", "");
    const token = req.cookies["Authorization"].replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    }); // finds _id from decoded payload
    if (!user) throw new Error();

    const event = await Event.findOne({ creator: user._id });

    req.event = event;
    req.token = token;
    req.user = user;

    res.locals.user = user;

    next();
  } catch (err) {
    res.status(403).send({ error: err.message });
  }
}

module.exports = auth;
