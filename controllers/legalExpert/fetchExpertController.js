const Expert = require('../../models/legalExpert/expertModel');

// Fetch list of all legal experts
fetchExpertsListForUser = async (req, res) => {
    let page = req.params.page ?? 1;
    let limit = 10;
    try {
        const expertList = await Expert.find({ active: true })
                .select('firstName lastName displayPicture experienceYears profession expertise')
                .populate("profession")
                .populate("expertise")
                .sort({ active: -1, firstName: 1, lastName: 1 })
                .skip((page * limit) - limit)
                .limit(limit);
        
        var totalCount = expertList.length;
        res.json({ totalCount, expertList });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Fetch data of a particular legal expert
fetchExpert = async (req, res) => {
    const expertId = req.params.id;

    try {
        const expert = await Expert.findById(expertId)
            .select('-password')
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