async function admin(req, res, next) {
  try {
    if (!req.user.isAdmin) throw new Error("Unauthorized Access");

    next();
  } catch (err) {
    req.flash("danger", `${err.message}`);
  }
}

module.exports = admin;
