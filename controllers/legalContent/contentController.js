const sectionModel = require('../../models/legalContent/sectionModel');
const Section = require('../../models/legalContent/sectionModel')
const SubSection = require('../../models/legalContent/subSectionModel')

// Fetch all sections
fetchSectionsList = async (req, res) => {
    const sectionList = await Section.find().sort({sectionNumber: 1});
    
    res.status(200).json({ sectionList });
};

// Fetch a sub section
fetchSubSection = async (req, res) => {
    const sectionId = req.params.id;
    const subSectionList = await SubSection.findOne({sectionId: sectionId});
    if (subSectionList == null){
        return res.status(400).json({ msg: "Invalid section Id" });
    }
    else{
        res.status(200).json({ sectionData: subSectionList });
    }
};

module.exports = {
    fetchSectionsList,
    fetchSubSection
}