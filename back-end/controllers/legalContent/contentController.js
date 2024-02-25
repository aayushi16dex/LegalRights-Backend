const sectionModel = require('../../models/legalContent/sectionModel');
const Section = require('../../models/legalContent/sectionModel')
const SubSection = require('../../models/legalContent/subSectionModel')

// Fetch all sections
fetchSectionsList = async (req, res) => {
    const sectionList = await Section.find();
    
    res.status(200).json({ sectionList });
};

// Fetch a sub section
fetchSubSection = async (req, res) => {
    const sectionId = req.params.id;
    const subSectionList = await SubSection.find({sectionId: sectionId});
    res.status(200).json({ sectionData: subSectionList });
};

module.exports = {
    fetchSectionsList,
    fetchSubSection
}