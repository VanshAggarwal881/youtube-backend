import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    avatar: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
    subscribersCount: {
      type: Number,
      default: 0,
      min: [0, "Subscriber count cannot be negative"],
    },
    channelsSubscribedToCount: {
      type: Number,
      default: 0,
      min: [0, "Subscribed channels count cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// direct encryption of password is not recommended, so we will use bcrypt to hash the password as the user is saving the password in clear text. Also mongoose hooks is required to hash the password before saving it to the database - pre hook
// pre hook takes two arguments, first argument is the hook name and second argument is the function to be executed before the hook , DON'T TAKE ARROW FUNCTION TAKE SIMPLE FUNCTION AS ARROW FUNCTION DOESN'T HAVE THIS KEYWORD . IT DOESN'T HAVE THE REFERECE OF THIS KEYWORD DUE TO WHICH IT WILL NOT BE ABLE TO ACCESS THE PASSWORD FIELD
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// creating a method to check the password is correct or not
userSchema.methods.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = mongoose.model("User", userSchema);
