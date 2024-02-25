const Section = require('../../models/legalContent/sectionModel')

// Add new section
fetchSections = async (req, res) => {
    var isEdit = req.params.id ? true : false;
    try {
        const sectionData = req.body;
        if (!isEdit){
            const isExisting = await Section.findOne({ sectionNumber: req.body.sectionNumber });
            if (isExisting){
                return res.status(409).json({ msg: 'Section number already exists' });
            }
            const sectionDoc = await Section.create(sectionData);
            await sectionDoc.save();

            return res.status(200).json({ _doc: sectionDoc, msg: 'Section created successfully' });
        }
        else {
            const sectionId = req.params.id;
            const updatedSection = await Section.findOneAndUpdate(
                { _id: sectionId },
                sectionData,
                { new: true, runValidators: true } // ensures validation is run
            );
            return res.status(200).json({ _doc: updatedSection, msg: 'Section updated successfully' });
       
        }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    addOrEditSection
}