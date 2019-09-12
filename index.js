const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: "sessions"
});

store.on("error", () => {
  console.log({ error: error.message });
});

const adminViews = require("./routes/admin");
const publicViews = require("./routes/public");
const users = require("./routes/users");
const events = require("./routes/events");
const guests = require("./routes/guests");

const User = require("./models/User");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "evenTAGS",
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// routes
app.use("/", publicViews);
app.use("/admin", adminViews);
app.use("/users", users);
app.use("/events", events);
app.use("/guests", guests);

// tests
// app.use(async (req, res, next) => {
//   try {
//     next();
//   } catch (err) {
//     console.log({ error: err.message });
//   }
// });

// db
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
