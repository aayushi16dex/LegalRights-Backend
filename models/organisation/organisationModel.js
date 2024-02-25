const mongoose = require('mongoose')

const organisationSchema = new mongoose.Schema({
    organisationName: {
        type: String,
        required: true
    },
    shortName:{
        type: String,
        required: false
    },
    description: {
        about: {
            type: String,
            required: true
        },
        vision: {
            type: String,
            required: true
        },
        mission: {
            type: String,
            required: true
        }
    },
    organisationImage: {
        type: String,
        required: false
    },
    websiteUrl: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model("Organisation", organisationSchema)