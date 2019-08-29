const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    minlength: 7,
    maxlength: 15
  },
  address: String,
  company: String,
  isVip: {
    type: Boolean,
    default: false
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Event"
  }
});

const Guest = mongoose.model("Guest", guestSchema);

module.exports = Guest;
