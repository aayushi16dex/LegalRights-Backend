const Organisation = require('../../models/organisation/organisationModel')
const fs = require('fs');

// Add or edit new organisation
addOrEditOrganisation = async (req, res) => {
    const isEdit = req.params.id ? true : false;
    try {
        const organisationData = req.body;
    
        const isExisting = await Organisation.findOne({ organisationName: req.body.organisationName });
        /** New organisation **/
        if (!isEdit) {
            if (isExisting) {
                return res.status(409).json({ msg: 'Organisation already exists' });
            } else {
                /** Get path of image */
                const organisationImage = setImagePath(req, res);
                organisationData.organisationImage = organisationImage;
                const organisationDoc = await Organisation.create(organisationData);
                await organisationDoc.save();
                return res.status(200).json({ _doc: organisationDoc, msg: 'Organisation registered successfully' });
            }
        }

        /** Edit organisation **/
        else {
            const organisationId = req.params.id;
            var doesExist = await Organisation.findOne({_id:organisationId});

            /** Get path of image */
            const organisationImage = setImagePath(req, res);
            
            /** If organisationId does not exist */
            if (doesExist == null){
                deleteImage(organisationImage);
                return res.status(404).json({msg: 'Organisation not found' });
            }
            
            /** If new image is there, replace it with previous one */
            if (organisationImage != ''){
                deleteImage(doesExist.organisationImage);
                organisationData.organisationImage = organisationImage;
            }
            
            const updatedOrganisation = await Organisation.findOneAndUpdate(
                { _id: organisationId },
                organisationData,
                { new: true, runValidators: true } // ensures validation is run
            );
            return res.status(200).json({ _doc: updatedOrganisation, msg: 'Organisation updated successfully' });

        }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

/** Delete organisation */
deleteOrganisation = async (req, res) => {
    const orgId = req.params.id;
    try {
        const organisation = await Organisation.findById(orgId)
        if (!organisation) {
            return res.status(404).json({ error: 'Organisation not found' });
        }
        const imageName = organisation.organisationImage;
        if (imageName != ''){
            deleteImage(imageName);
        }
        await organisation.deleteOne();
        res.status(200).json({ msg: 'Organisation deleted successfully' });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

function setImagePath(req, res) {
    // Return empty strings
    if (!req.file) {
        return '';
    }

    const { path, originalname } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1].toLowerCase();
    const allowedExtensions = ['png', 'jpg', 'jpeg'];

    if (!allowedExtensions.includes(ext)) {
        // Delete the file and respond with an error if it's not an allowed image type
        fs.unlinkSync(path);
        return res.status(400).json({ error: 'Invalid file type. Only PNG, JPEG, or JPG images are allowed.' });
    }

    const newPath = path + '.' + ext;
    try {
        fs.renameSync(path, newPath);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'File renaming error' });
    }
    return newPath;
}

function deleteImage(filePath){
     // Check if the file exists before attempting to delete
     if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            // console.log(`Deleted file: ${filePath}`);
        } catch (error) {
            console.error(`Error deleting file: ${filePath}`, error);
        }
    } else {
        // console.warn(`File does not exist: ${filePath}`);
    }
}

module.exports = {
    addOrEditOrganisation,
    deleteOrganisation
}