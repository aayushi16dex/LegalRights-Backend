const Expert = require('../../models/legalExpert/expertModel');
const AskExpert = require('../../models/legalExpert/askExpertModel');
const authenticateUser = require('../../middleware/authenticateUser');
const bcrypt = require('bcrypt');   //password hashing
const bcryptSalt = process.env.SALT_ROUNDS;

// change expert password after first time login
changePassword = async (req, res) => {
    const expertData = await authenticateUser(req, res);
    const expertId = expertData.userId;

    const salt = await bcrypt.genSalt(Number(bcryptSalt));
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    try {
        await Expert.updateOne(
            { _id: expertId },
            { $set: { password: hashedPassword } },
            { new: true }  // returns modified doc
        );
        res.status(200).json({ error: "Password updated successfully" });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// Fetch unanswered user queries for a particular legal expert
fetchUnansweredUserQueries = async (req, res) => {
    const userData = await authenticateUser(req);
    const expertId = userData.userId;

    try {
        const queryList = await AskExpert.find({ expertId: expertId, answered: false });
        res.status(200).json({ queryList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Fetch answered user queries for a particular legal expert
fetchAnsweredUserQueries = async (req, res) => {
    const userData = await authenticateUser(req);
    const expertId = userData.userId;

    try {
        const queryList = await AskExpert.find({ expertId: expertId, answered: true });
        res.status(200).json({ queryList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Expert answers the query posted by user
answerQuery = async (req, res) => {
    const queryId = req.params.id;
    const newResponse = req.body.response;

    try {
        const updatedQuery = await AskExpert.updateOne(
            { _id: queryId },
            {
                $set: {
                    response: newResponse,
                    answered: true
                }
            }
        );

        if (updatedQuery.modifiedCount > 0) {
            // Document updated successfully
            return res.status(200).json({ msg: 'Query answered successfully' });
        } else {
            // No documents matched the query criteria
            return res.status(404).json({ msg: 'Query not found' });
        }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: 'Internal Server Error' });
    }

}

fetchQueryCount = async(req, res) => {
    const userData = await authenticateUser(req);
    const expertId = userData.userId;

    try {
        const totalQueryCount = await AskExpert.countDocuments({ expertId: expertId});
        const answeredQueryCount = await AskExpert.countDocuments({ expertId: expertId, answered: true });
        const unansweredQueryCount = await AskExpert.countDocuments({ expertId: expertId, answered: false });
        res.status(200).json({ totalQueryCount, answeredQueryCount, unansweredQueryCount  });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports =
{
    changePassword,
    fetchUnansweredUserQueries,
    fetchAnsweredUserQueries,
    answerQuery,
    fetchQueryCount
};