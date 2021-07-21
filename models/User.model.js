const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      // unique: true -> Ideally, should be unique, but its up to you
    },
    password: {
      type: String,
      required: true,
    },
    name: String,
    lastname: String,
    gender: String, //male or female
    division: String,
    country: String,
    age: Number,
    role: String, //Athlete or Coach
    favorites: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    excluded: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);

//DRY Dont repeat yourself
