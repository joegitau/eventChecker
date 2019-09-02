const express = require("express");
const mongoose = require("mongoose");
const app = express();

const users = require("./routes/users");
const events = require("./routes/events");
const guests = require("./routes/guests");

app.use(express.json());

// routes
app.use("/users", users);
app.use("/events", events);
app.use("/guests", guests);

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
