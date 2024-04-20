const Expert = require('../../models/legalExpert/expertModel');
const AskExpert = require('../../models/legalExpert/askExpertModel');
const authenticateUser = require('../../middleware/authenticateUser');
const bcrypt = require('bcrypt');   //password hashing
const bcryptSalt = process.env.SALT_ROUNDS;

// change expert password after first time login
changePassword = async (req, res) => {
    const expertData = await authenticateUser(req, res);
    const userId = expertData.userId;
    const oldPassword = req.body.oldPassword;

    const passwordMatches = await comparePassword(res, expertData, oldPassword);
    if (!passwordMatches) {
        return res.status(400).json({ msg: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(Number(bcryptSalt));
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    try {
        await Expert.updateOne(
            { _id: userId },
            { $set: { password: hashedPassword } },
            { new: true }  // returns modified doc
        );
        res.status(200).json({ error: "Password changed successfully" });
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
    let page = req.params.page ?? 1;
    let limit = 10;

    try {
        const queryList = await AskExpert.find({ expertId: expertId, answered: false })
                                        .skip((page * limit) - limit)
                                        .limit(limit)
                                        .populate({
                                            path: "userId",
                                            select: "firstName lastName" 
                                        });
        var count =queryList.length;
        res.status(200).json({ count, queryList});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Fetch answered user queries for a particular legal expert
fetchAnsweredUserQueries = async (req, res) => {
    const userData = await authenticateUser(req);
    const expertId = userData.userId;
    let page = req.params.page ?? 1;
    let limit = 10;

    try {
        const queryList = await AskExpert.find({ expertId: expertId, answered: true })
                                        .skip((page * limit) - limit)
                                        .limit(limit)
                                        .populate({
                                            path: "userId",
                                            select: "firstName lastName" 
                                        });
        var count =queryList.length;
        res.status(200).json({ count, queryList });
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

async function comparePassword(res, userData, password) {

    var userDoc = await Expert.findOne({ _id: userData.userId }, { password: 1 });
    if (!userDoc) {
        return res.status(404).json({ msg: 'User not found' });
    }
    var storedPassword = userDoc.password;
    const isPasswordCorrect = await bcrypt.compare(password, storedPassword);
    return isPasswordCorrect;
}

module.exports =
{
    changePassword,
    fetchUnansweredUserQueries,
    fetchAnsweredUserQueries,
    answerQuery,
    fetchQueryCount
};