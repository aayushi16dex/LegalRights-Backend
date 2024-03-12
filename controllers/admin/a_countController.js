const User = require('../../models/user/userModel')
const Expert = require('../../models/legalExpert/expertModel')
const Organisation = require('../../models/organisation/organisationModel')
const Section = require('../../models/legalContent/sectionModel')

// Fetch count for admin homepage
fetchCount = async (req, res) => {
    const userCount = await User.countDocuments({role:'CHILD'});
    const expertCount = await Expert.countDocuments({role:'LEGAL_EXPERT'});
    const organisationCount = await Organisation.countDocuments();
    const legalRightCount = await Section.countDocuments();
    res.status(200).json({userCount, expertCount, organisationCount, legalRightCount});
}

module.exports = {
    fetchCount
}