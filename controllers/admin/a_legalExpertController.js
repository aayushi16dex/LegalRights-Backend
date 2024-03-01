const Profession = require('../../models/legalExpert/professionModel');
const Language = require('../../models/legalExpert/languageModel');
const Expertise = require('../../models/legalExpert/expertiseModel');
const IndianStates = require('../../models/legalExpert/indianStatesModel');
const Expert = require('../../models/legalExpert/expertModel');

// Add profession   
addProfession =  async (req, res) => {
    try {
        const isExisting = await Profession.findOne({ professionName: req.body.professionName });
        if (isExisting) {
            return res.status(409).json({ msg: 'Profession already exists' });
        }
      
        const professionData = {
            professionName: req.body.professionName
        };
     
        const professionDoc = await Profession.create(professionData);
        await professionDoc.save();

        return res.status(201).json({ professionDoc, msg: 'Profession added successfully' });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
  };

// Add languages   
addLanguage = async (req, res) => {
    try {
        const isExisting = await Language.findOne({ languageName: req.body.languageName });
        if (isExisting) {
            return res.status(409).json({ msg: 'Language already exists' });
        }
      
        const languageData = {
            languageName: req.body.languageName
        };
     
        const languageDoc = await Language.create(languageData);
        await languageDoc.save();

        return res.status(201).json({ languageDoc, msg: 'Language added successfully' });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
  };

// Add expertise 
addExpertise = async (req, res) => {  
    try {
        const isExisting = await Expertise.findOne({ expertiseField: req.body.expertiseField });
        if (isExisting) {
            return res.status(409).json({ msg: 'Expertise already exists' });
        }
      
        const expertiseData = {
            expertiseField: req.body.expertiseField
        };
     
        const expertiseDoc = await Expertise.create(expertiseData);
        await expertiseDoc.save();

        return res.status(201).json({ expertiseDoc, msg: 'Expertise added successfully' });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
  };

// Get list of all professions
fetchProfessions = async (req, res) => {
    res.json(await Profession.find().sort({professionName:1}));
}

// Get list of all languages
fetchLanguages = async (req, res) => {
    res.json(await Language.find().sort({languageName:1}));
}

// Get list of all expertise
fetchExpertise = async (req, res) => {
    res.json(await Expertise.find().sort({expertiseField:1}));
};

// Get list of all states
fetchStates =  async (req, res) => {
    res.json(await IndianStates.find().sort({name:1}));
}

// Activate or deactivate legal expert account
changeExpertStatus = async (req, res) => {
    const expertId = req.params.id;
    try {
        const expert = await Expert.findById(expertId)
        if (!expert) {
            return res.status(404).json({ error: 'Expert not found' });
        }
        if (expert.active == true) {
            expert.set({ active: false })
            await expert.save();
            res.status(200).json({ msg: 'Account status set to inactive' });
        }
        else {
            expert.set({ active: true })
            await expert.save();
            res.status(200).json({ msg: 'Account status set to active' });
        }

    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// Fetch legal experts
fetchExpertsListForAdmin = async (req, res) => {
    let page = req.params.page ?? 1;
    let limit = 10;
    const expertList = await Expert.find()
                            .select('firstName lastName displayPicture experienceYears profession expertise active')
                            .populate("profession")
                            .populate("expertise")
                            .sort({active: -1, firstName: 1, lastName: 1})
                            .skip((page * limit) - limit)
                            .limit(limit);
    var totalCount = expertList.length;
    res.json({ activeExpertCount: totalCount, expertList });
}


module.exports = {
    addProfession,
    addLanguage,
    addExpertise,
    fetchProfessions,
    fetchLanguages,
    fetchExpertise,
    fetchStates,
    changeExpertStatus,
    fetchExpertsListForAdmin
};