const Section = require('../../models/legalContent/sectionModel');
const SubSection = require('../../models/legalContent/subSectionModel');
const fs = require('fs');

const subSectionFields = ['introductionVideo', 'contentVideo1', 'narratorVideo', 'contentVideo2'];
// Add or edit section
addOrEditSection = async (req, res) => {
    var isEdit = req.params.id ? true : false;
    try {
        const sectionData = req.body;

        // New section
        if (!isEdit) {
            const isExisting = await Section.findOne({ sectionNumber: req.body.sectionNumber });
            if (isExisting) {
                return res.status(409).json({ msg: 'Section number already exists' });
            }
            const sectionDoc = await Section.create(sectionData);
            await sectionDoc.save();

            createSubSection(sectionDoc._id);

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

// Delete section and subSection
deleteSection = async (req, res) => {
    const sectionId = req.params.id;
    try {
        const section = await Section.findById(sectionId)
        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }

        // Subsection always exists as it is formed by default
        // Find subsection and delete it and all the associated videos
        const subSection = await SubSection.findOne({ sectionId: sectionId });
        deleteVideos(subSection, subSectionFields);
        await SubSection.findByIdAndDelete(subSection._id);

        await section.deleteOne();
        res.status(200).json({ msg: 'Section deleted successfully' });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// Adding content to sub section
editSubSection = async (req, res) => {
    try {
        var subSectionData = {};

        if (req.body.introductionVideo != null) {
            subSectionData.introductionVideo = req.body.introductionVideo;
        }
        if (req.body.contentVideo1 != null) {
            subSectionData.contentVideo1 = req.body.contentVideo1;
        }
        if (req.body.narratorVideo != null) {
            subSectionData.narratorVideo = req.body.narratorVideo;
        }
        if (req.body.contentVideo2 != null) {
            subSectionData.contentVideo2 = req.body.contentVideo2;
        }
        const subSectionDoc = await SubSection.findOneAndUpdate(
            { sectionId: req.params.id },
            subSectionData,
            { new: true }
        );

        return res.status(200).json({ subSectionDoc, msg: 'Videos added successfully' });

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Function for creating sub section when each section is created
async function createSubSection(sectionId) {
    try {
        await new SubSection({
            sectionId: sectionId
        }).save();
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

/** Delete already existing files **/
function deleteVideos(subSectionDoc, fieldNames) {
    for (const fieldName of fieldNames) {
        if (subSectionDoc && subSectionDoc[fieldName]) {
            const filePath = subSectionDoc[fieldName];

            // Check if the file exists before attempting to delete
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    // console.log(`Deleted file: ${filePath}`);
                } catch (error) {
                    // console.error(`Error deleting file: ${filePath}`, error);
                }
            } else {
                console.warn(`File does not exist: ${filePath}`);
            }
        }
    }
}
module.exports = {
    addOrEditSection,
    deleteSection,
    editSubSection
}