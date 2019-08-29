const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  eventDate: {
    type: String,
    required: true
  },
  eventTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
});

// virtual relation with guest
// eventSchema.virtual("guests", {
//   ref: "Guest",
//   localField: "_id",
//   foreignField: "eventId"
// });

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
