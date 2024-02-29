const Organisation = require('../../models/organisation/organisationModel')

// Fetch list of all organisations
fetchOrganisationsList = async (req, res) => {
    let page = req.params.page ?? 1;
    let limit = 10;
    const orgList= await Organisation.find()
                                .skip((page * limit) - limit)
                                .limit(limit);
    var totalCount = orgList.length;
    res.status(200).json({ totalCount, orgList });
}

// Fetch data of a particular organisation
fetchOrganisation = async (req, res) => {
    const orgId = req.params.id;

    try {
        const organization = await Organisation.findById(orgId);

        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        res.status(200).json(organization);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    fetchOrganisation,
    fetchOrganisationsList
}