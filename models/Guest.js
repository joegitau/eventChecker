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
      enum: ["guest", "vip", "staff"],
      default: "guest",
      validate: {
        validator: function(v) {
          if (v !== "guest" || v !== "vip" || v !== "staff") {
            return;
          }
        },
        message: "Status must either be, guest, vip or staff"
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
