const mongoose = require('mongoose')

const stateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Indian_States", stateSchema)