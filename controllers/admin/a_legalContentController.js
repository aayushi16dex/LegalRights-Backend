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
        saveVideos(req, res);
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

// Function to add videos of sub section
async function saveVideos(req, res) {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    var sectionId = req.params.id;
    const files = req.files;
    const allowedExtensions = ['mp4'];
    const errors = [];

    const fieldNames = Object.keys(files);
    const subSectionDoc = await SubSection.findOne({ sectionId: sectionId });

    // Delete already existing files
    deleteVideos(subSectionDoc, fieldNames );

    Object.keys(files).forEach(key => {
        const file = files[key][0];
        const { path, originalname } = file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1].toLowerCase();

        if (!allowedExtensions.includes(ext)) {
            // Delete the file and add an error message if it's not an allowed video type
            fs.unlinkSync(path);
            errors.push(`Invalid file type for ${originalname}. Only MP4 videos are allowed.`);
            return;
        }

        const newPath = path + '.' + ext;
        try {
            fs.renameSync(path, newPath);
        } catch (error) {
            errors.push(`Error renaming file ${originalname}`);
            return;
        }

        SubSection.findOneAndUpdate(
            { sectionId: sectionId },
            { $set: { [key]: newPath } },
            { new: true }
        )
            .then((updatedDoc) => {
                if (updatedDoc) {
                    return;
                } else {
                    console.log("Error occured");
                    return;
                }
            })
            .catch((error) => {
                console.log(error.message)
                errors.push(error);
            });
    });
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    res.status(200).json({ msg: "All videos have been successfully uploaded" });
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