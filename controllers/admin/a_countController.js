const User = require('../../models/user/userModel')
const Expert = require('../../models/legalExpert/expertModel')
const Organisation = require('../../models/organisation/organisationModel')

// Fetch count for admin homepage
fetchCount = async (req, res) => {
    const userCount = await User.countDocuments({role:'CHILD'});
    const expertCount = await Expert.countDocuments({role:'LEGAL_EXPERT'});
    const organisationCount = await Organisation.countDocuments();
    res.status(200).json({userCount, expertCount, organisationCount});
}

module.exports = {
    fetchCount
}