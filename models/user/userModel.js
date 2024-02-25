const Ask_Expert = require('../../models/legalExpert/askExpertModel');
const UserProfile = require('../../models/user/userProfileModel')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["ADMIN", "CHILD"]
    },
    joinedOn: {
        type: String,
        required: true
    },
    displayPicture: {
        type: String,
        required: false,
        default: ""
    }
},
{timestamps: true},)

userSchema.pre('deleteOne', async function (next) {
    try {
      // Remove all expert queries, and profile data related to the user
      var id = this._conditions._id;
      await Ask_Expert.deleteMany({ userId: id });
      await UserProfile.deleteOne({ userId: id });
      next();
    } catch (error) {
      next(error);
    }
  });

  module.exports = mongoose.model("User", userSchema)