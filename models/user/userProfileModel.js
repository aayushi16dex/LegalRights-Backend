const mongoose = require('mongoose')

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    soundEffect: {
        type: Boolean,
        required: true,
        default: false
    },
    language: {
        type: String,
        required: true,
        default: "English"
    },
    fontSize: {
        type: Number,
        required: true,
        default: 12
    },
    badgeList: {
        type: [String],
        default: []
    }
},
{timestamps: true},)

module.exports = mongoose.model("UserProfile", userProfileSchema)
