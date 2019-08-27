const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function admin(req, res, next) {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = await jwt.verify(token, "jwtPrivateKey");

    const user = await User.findOne({
      _id: decoded._id,
      isAdmin: decoded.isAdmin,
      "tokens.token": token
    });
    if (!user) throw new Error();

    req.token = token;
    req.user = user;

    next();
  } catch (err) {
    res.status(403).send("user Not Authorized.");
  }
}

module.exports = admin;
