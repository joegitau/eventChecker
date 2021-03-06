const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const helmet = require("helmet");
const xss = require("xss-clean");
// const rateLimiter = require("express-rate-limiter");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const adminViews = require("./routes/admin");
const publicViews = require("./routes/public");
const users = require("./routes/users");
const events = require("./routes/events");
const guests = require("./routes/guests");

// const limiter = rateLimiter({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 5, // block after 5 requests
//   message: "Too many login attemps, please try again after 1 Hour"
// });

app.use(helmet());
app.use(mongoSanitize());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(mongoSanitize());
app.use(express.static(path.join(__dirname, "public")));

// flash messages
app.use(
  session({
    secret: "eventstag",
    resave: true,
    saveUninitialized: true
  })
);

app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// routes
app.use("/", publicViews);
app.use("/admin", adminViews);
app.use("/users", users);
app.use("/events", events);
app.use("/guests", guests);

// 404
app.use((req, res) => {
  res.status(401).render("not-found", { error: "Page Not Found" });
});

// 500
app.use((error, req, res, next) => {
  res.status(500).render("not-found", { error: "Internal Server Errors" });
});

// tests
// app.use((req, res, next) => {
//   console.log(req.headers);
//   next();
// });

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error("Could not connect to MongoDB..."));

const port = process.env.PORT;
app.listen(port, () => console.log("Listening on port " + port + "..."));
