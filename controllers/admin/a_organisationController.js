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
                const organisationDoc = await Organisation.create(organisationData);
                await organisationDoc.save();
                return res.status(200).json({ _doc: organisationDoc, msg: 'Organisation registered successfully' });
            }
        }

        /** Edit organisation **/
        else {
            const organisationId = req.params.id;
            var doesExist = await Organisation.findOne({_id:organisationId});
            
            /** If organisationId does not exist */
            if (doesExist == null){
                return res.status(404).json({msg: 'Organisation not found' });
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
        await organisation.deleteOne();
        res.status(200).json({ msg: 'Organisation deleted successfully' });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    addOrEditOrganisation,
    deleteOrganisation
}