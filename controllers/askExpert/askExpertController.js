const AskExpert = require('../../models/legalExpert/askExpertModel');
const authenticateUser = require('../../middleware/authenticateUser')

// User adds query
raiseQuery = async (req, res) => {
    try {
        const userData = await authenticateUser(req, res);
        const queryData = {
            userId: userData.userId,
            expertId: req.body.expertId,
            query: req.body.query
        };

        const queryDoc = await AskExpert.create(queryData);
        await queryDoc.save();

        return res.status(200).json({ queryDoc, msg: 'Query added successfully' });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Fetch all queries added by a particular user
fetchUserQuery = async (req, res) => {
    const userData = await authenticateUser(req);
    const userId = userData.userId;
    const [queryList, totalCount] = await Promise.all([
        AskExpert.find({ userId: userId }),
        AskExpert.countDocuments({ userId: userId })
    ]);
    res.json({ totalCount, queryList });
};

module.exports = {
    fetchUserQuery,
    raiseQuery
};