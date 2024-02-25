const Expert = require('../../models/legalExpert/expertModel');

// Fetch list of all legal experts
fetchExpertsListForUser = async (req, res) => {
    const [expertList, totalCount] = await Promise.all([
        Expert.find({active: true})
            .select('firstName lastName displayPicture experienceYears profession expertise')
            .populate("profession")
            .populate("expertise")
            .sort({active: -1, firstName: 1, lastName: 1}),
        Expert.countDocuments({ active: true }),
    ]);
    res.json({ totalCount, expertList });
}

// Fetch data of a particular legal expert
fetchExpert = async (req, res) => {
    const expertId = req.params.id;

    try {
        const expert = await Expert.findById(expertId)
            .populate("languagesKnown")
            .populate("expertise")
            .populate("profession")
            .populate("state");

        if (!expert) {
            return res.status(404).json({ error: 'Legal expert not found' });
        }

        res.json(expert);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports =
{
    fetchExpertsListForUser,
    fetchExpert
};