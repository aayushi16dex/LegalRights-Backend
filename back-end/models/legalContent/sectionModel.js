const mongoose = require('mongoose')

const sectionSchema = new mongoose.Schema({
    sectionNumber: {
        type: Number,
        required: true
    },
    totalUnits: {
        type: Number,
        required: false,
        default: 4
    },
    title: {
        type: String,
        required: true
    },
    subTitle: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
},
    { timestamps: true },)

module.exports = mongoose.model("Section", sectionSchema)
