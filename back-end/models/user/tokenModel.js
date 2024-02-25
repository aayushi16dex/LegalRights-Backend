const mongoose = require('mongoose')
const tokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 1200        // this is the expiry time in seconds - 20 minutes
    },
})

module.exports = mongoose.model("Token", tokenSchema)
