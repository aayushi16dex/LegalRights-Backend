const mongoose = require('mongoose')

const expertiseSchema = new mongoose.Schema({
    expertiseField: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model("Expertise", expertiseSchema)
