const Language = require('./languageModel')
const Expertise = require('./expertiseModel')
const Indian_States = require('./indianStatesModel')
const Profession = require('./professionModel')


const mongoose = require('mongoose')

const expertSchema = new mongoose.Schema({
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
        enum: ["LEGAL_EXPERT"]
    },
    joinedOn: {
        type: String,
        required: true
    },
    displayPicture: {
        type: String,
        required: false,
        default: ""
    },
    languagesKnown: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        ref: "Language"
    },
    experienceYears: {
        type: Number,
        required: true
    },
    expertise: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        ref: "Expertise"
    },
    profession: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profession"
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Indian_States"
    },
    country: {
        type: String,
        required: false,
        default: "India"
    },
    active: {
        type: Boolean,
        default: true
    }
},
    { timestamps: true },)

expertSchema.pre("save", async function (next) {
    try {
        const languageIds = this.languagesKnown || [];
        const expertiseIds = this.expertise || [];
        const stateId = this.state;
        const professionId = this.profession;


        // Check if all language IDs exist in the "Language" collection
        const languagesExist = await Language.countDocuments({ _id: { $in: languageIds } }) === languageIds.length;
        const expertiseExist = await Expertise.countDocuments({ _id: { $in: expertiseIds } }) === expertiseIds.length;
        const stateExists = await Indian_States.exists({ _id: stateId });
        const professionExists = await Profession.exists({ _id: professionId });



        if (!languagesExist) {
            const invalidLanguageIds = languageIds.filter(async id => !await Language.exists({ _id: id }));
            throw new Error(`Invalid language IDs: ${invalidLanguageIds.join(', ')}`);
        }
        if (!expertiseExist) {
            const invalidExpertiseIds = expertiseIds.filter(async id => !await Expertise.exists({ _id: id }));
            throw new Error(`Invalid expertise IDs: ${invalidExpertiseIds.join(', ')}`);
        }
        if (!stateExists) {
            throw new Error(`Invalid state ID: ${stateId}`);
        }
        if (!professionExists) {
            throw new Error(`Invalid profession ID: ${professionId}`);
        }

        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("Expert", expertSchema)
