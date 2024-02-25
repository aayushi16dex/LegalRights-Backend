const mongoose = require('mongoose')
const Expert = require('./expertModel')

const askExpertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    expertId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Expert",
    },
    query: {
        type: String,
        required: true
    },
    response: {
        type: String,
        required: false,
        default: ""
    },
    answered: {
        type: Boolean,
        default: false
    }
},
{timestamps: true},)


askExpertSchema.pre("save", async function (next) {
    try {
        const expertId = this.expertId;
        const expertExists = await Expert.exists({ _id: expertId });
        if (!expertExists) {
            throw new Error(`Invalid expert ID: ${expertId}`);
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("Ask_Expert", askExpertSchema)
