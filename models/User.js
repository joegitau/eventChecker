const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const Event = require("../models/Event");

const userSchema = new mongoose.Schema(
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
    password: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      minlength: 7,
      maxlength: 15
    },
    address: String,
    company: String,
    isAdmin: {
      type: Boolean,
      default: false
    },
    avatar: Buffer,
    tokens: [
      {
        token: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// hash password
userSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// verify login credentials
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid email or password");

  const isPassword = await bcrypt.compare(password, user.password);
  if (!isPassword) throw new Error("Invalid email or password");

  return user;
};

// generate webtokens
userSchema.methods.generateAuthToken = async function() {
  const token = jwt.sign(
    { _id: this._id.toString(), isAdmin: this.isAdmin.toString() },
    process.env.JWT_PRIVATE_KEY
  );

  this.tokens = this.tokens.concat({ token });

  await this.save();
  return token;
};

// hide private data
userSchema.methods.toJSON = function() {
  const userObj = this.toObject();

  delete userObj.password;
  delete userObj.tokens;
  delete userObj.avatar;

  return userObj;
};

// Virtual realtionship with Events
userSchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "creator"
});

// delete user's events once profile is deleted
userSchema.pre("remove", async function(next) {
  await Event.deleteMany({ creator: this._id });

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
