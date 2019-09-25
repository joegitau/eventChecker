const mongoose = require("mongoose");

const guestSchema = new mongoose.Schema(
  {
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
      type: String,
      enum: ["GUEST", "VIP", "STAFF"],
      default: "GUEST",
      uppercase: true,
      validate: {
        validator: function(v) {
          if (v !== "GUEST" || v !== "VIP" || v !== "STAFF") {
            return;
          }
        },
        message: "Status must either be, GUEST, VIP or STAFF"
      }
    },
    isArrived: {
      type: String,
      uppercase: true,
      enum: ["ARRIVED", "ABSENT"],
      default: "ABSENT",
      validate: {
        validator: function(v) {
          if (v !== "ARRIVED" || v !== "ABSENT") {
            return;
          }
        },
        message: "Availabilty must either be, ABSENT or ARRIVED"
      }
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Event"
    }
  },
  {
    timestamps: true
  }
);

const Guest = mongoose.model("Guest", guestSchema);

module.exports = Guest;
