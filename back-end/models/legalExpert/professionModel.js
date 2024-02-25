const mongoose = require('mongoose')

const professionSchema = new mongoose.Schema({
    professionName: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Profession", professionSchema)
