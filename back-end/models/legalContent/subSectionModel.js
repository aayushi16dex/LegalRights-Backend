const mongoose = require('mongoose')

const subSectionSchema = new mongoose.Schema({
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Section",
    },
    introductionVideo: {
        type: String,
        required: false,
        default: ""
    },
    contentVideo1: {
        type: String,
        required: false,
        default: ""
    },
    narratorVideo: {
        type: String,
        required: false,
        default: ""
    },
    contentVideo2: {
        type: String,
        required: false,
        default: ""
    }
},
    { timestamps: true },)

module.exports = mongoose.model("SubSection", subSectionSchema)
