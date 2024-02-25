const mongoose = require('mongoose')

const languageSchema = new mongoose.Schema({
    languageName: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model("Language", languageSchema)
