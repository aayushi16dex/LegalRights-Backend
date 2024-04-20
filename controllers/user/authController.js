const app = require('express').Router();
const User = require('../../models/user/userModel');
const Expert = require('../../models/legalExpert/expertModel')
const UserProfile = require('../../models/user/userProfileModel')
const authenticateUser = require('../../middleware/authenticateUser')
const XUser = require('../../utils/constants/XUser')
const bcrypt = require('bcrypt');   //password hashing
const bcryptSalt = process.env.SALT_ROUNDS;
const jwt = require('jsonwebtoken');   //authentication
const generator = require('generate-password');

const cookieParser = require('cookie-parser');
const sendEmail = require('../../utils/email/sendEmail');
app.use(cookieParser());

/** Role and password cannot be updated*/
var role;
var isExisting = false;
var userPassword;
var salt;
var hashedPassword;

// Register or edit user  
registerOrEditUser = async (req, res) => {
    try {
        var isEdit = req.params.id ? true : false;
        // Handles edit
        if (isEdit) {
            const userData = await authenticateUser(req, res);
            if (!userData) {
                console.log(error.message);
                return res.status(500).json({ error: "Internal server error" });
            }
            else if (userData.userId != req.params.id) {
                return res.status(403).json({ error: "Access denied" });
            }
            // Checks if req email is not there in DB
            else if (await isRequestedNewEmailPresent(req.body.email, userData)) {
                return res.status(409).json({ error: "Requested email already exists" });
            }
            editChild(req, res)
        }
        // Handles register
        else {
            role = XUser.ROLE_CHILD
            isExisting = await User.findOne({ email: req.body.email });
            if (isExisting) {
                return res.status(409).json({ msg: 'Email has already been registered' });
            }
            var userBody = req.body;
            userBody.password = await hashPassword(userBody.password),
            userBody.joinedOn = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            registerChild(userBody, res);
        }
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Register or edit legal expert   
registerOrEditExpert = async (req, res) => {
    try {
        var isEdit = req.params.id ? true : false;
        // Handles edit
        if (isEdit) {
            const userData = await authenticateUser(req, res);
            if (!userData) {
                console.log(error.message);
                return res.status(500).json({ error: "Internal server error" });
            }
            // Checks if user editing the profile is the expert himself or admin
            else if (userData.userId != req.params.id && userData.role != XUser.ROLE_ADMIN) {
                return res.status(403).json({ error: "Access denied" });
            }
            // Checks if req email is not there in DB
            else if (await isRequestedNewEmailPresent(req.body.email, userData)) {
                return res.status(409).json({ error: "Requested email already exists" });
            }
            editExpert(req, res)
        }
        // Handles register
        else {
            role = XUser.ROLE_LEGALEXPERT
            isExisting = await Expert.findOne({ email: req.body.email });
            // In case of new registration request, if expert is already registered 
            if (isExisting) {
                return res.status(409).json({ msg: 'Email has already been registered' });
            }
            userPassword = await generatePassword();
            var expertData = req.body;
            expertData.password = await hashPassword(userPassword);
            expertData.joinedOn = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            registerExpert(expertData, res, userPassword);
        }
    }
    catch (error) {
        console.log(error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


// User or legal expert logs in
loginUser = async (req, res) => {
    var userData;
    try {
        const userDoc = await User.findOne(
            { email: req.body.email },
            'firstName lastName password role joinedOn displayPicture');

        const expertDoc = await Expert.findOne(
            { email: req.body.email },
            'firstName lastName password role joinedOn displayPicture');
        var role;
        var storedPassword;
        var token;

        if (!userDoc && !expertDoc) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        else if (userDoc) {
            role = userDoc.role;
            storedPassword = userDoc.password;
            token = await createToken(userDoc._id.toString(), role);
            userData = userDoc;
        }
        else if (expertDoc) {
            role = expertDoc.role;
            storedPassword = expertDoc.password;
            token = await createToken(expertDoc._id.toString(), role);
            userData = expertDoc;
        }

        // entered password, stored password
        const comparePassword = await bcrypt.compare(req.body.password, storedPassword);
        if (!comparePassword) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const { password, ...others } = userData._doc;

        // 200: Everything is okay
        return res
            .cookie('token', token, {
                httpOnly: true,  // make the cookie accessible only through HTTP requests
                secure: true,    // ensure the cookie is only sent over HTTPS connection
                sameSite: 'None'
            })
            .status(200)
            .json({ msg: "Login successful", userData: others, token });
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// User/ admin/ legal expert logs out
logoutUser = (req, res) => {
    res
        .clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
        })
        .status(200)
        .json("Logged out");
}

// Function for creating token
async function createToken(userId, role) {
    const expiresIn = 60 * 60 * 24 * 30; // 30 days in seconds
    const payload = {
        role: role,
        userId: userId
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    return token;
}

// function for creating user profile, general user setting
async function createProfile(userId) {
    try {
        await new UserProfile({
            userId: userId
        }).save();
    }
    catch (e) {
        return e;
    }
}

// function for handling user register
async function registerChild(userBody, res) {
    try {
        const userDoc = await User.create(userBody);
        await userDoc.save();
        const token = await createToken(userDoc._id, userDoc.role);
        await createProfile(userDoc);
        const { password, ...others } = userDoc._doc;

        return res
            .cookie('token', token, {
                httpOnly: true,  // make the cookie accessible only through HTTP requests
                secure: true,    // ensure the cookie is only sent over HTTPS connection
                sameSite: 'None'
            })
            .status(201).json({ userData: others, token, msg: 'Successfully registered' });
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// function for handling child updation
async function editChild(req, res) {
    try {
        const userId = req.params.id;
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            req.body,
            { new: true, runValidators: true } // ensures validation is run
        );

        const { password, ...others } = updatedUser._doc;

        return res.status(200).json({ userData: others, msg: 'User profile updated successfully' });
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// function to handle expert register
async function registerExpert(expertData, res, userPassword) {
    try {
        const expertDoc = await Expert.create(expertData);
        await expertDoc.save();

        const { password, ...others } = expertDoc._doc;
        var expertName = expertData.firstName;
        var expertEmail = expertData.email;
        // Check if last name exists and is not an empty string
        if (expertData.lastName && expertData.lastName.trim() !== "") {
            expertName += " " + expertData.lastName;
        }

        await sendEmail(
            expertEmail,
            "Profile created successfully",
            { name: expertName, email: expertEmail, password: userPassword },
            "./template/expertAccountCreation.handlebars",
            res
        );
        return res.status(201).json({ userData: others, msg: 'Successfully registered' });
    }
    catch (error) {
        // Handle the validation error
        if (error.message.startsWith('Invalid')) {
            res.status(400).json({ error: error.message });
        } else {
            console.error(error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

// function to handle expert updation
async function editExpert(req, res) {
    try {
        const expertId = req.params.id;
        const updatedExpert = await Expert.findOneAndUpdate(
            { _id: expertId },
            req.body,
            { new: true, runValidators: true } // ensures validation is run
        );

        const { password, ...others } = updatedExpert._doc;

        return res.status(200).json({ userData: others, msg: 'Legal expert profile updated successfully' });
    }
    catch (error) {
        // Handle the validation error
        if (error.message.startsWith('Invalid')) {
            res.status(400).json({ error: error.message });
        } else {
            console.error(error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

// checks if requested new email is not already there in DB
async function  isRequestedNewEmailPresent(email, userData) {
    if (userData.role == XUser.ROLE_CHILD) {
        const response = await User.findOne({ email, _id: { $ne: userData.userId } });
        return response ? true : false;
    }
    else if (userData.role == XUser.ROLE_LEGALEXPERT) {
        const response = await Expert.findOne({ email, _id: { $ne: userData.userId } });
        return response ? true : false;
    }
    else {
        console.log("No role found");
        return false;
    }
}

async function  hashPassword(userPassword) {
    salt = await bcrypt.genSalt(Number(bcryptSalt));
    hashedPassword = await bcrypt.hash(userPassword, salt);
    return hashedPassword;
}

async function generatePassword(){
    const password = generator.generate({
        length: 8, 
        uppercase: true, 
        lowercase: true, 
        numbers: true, 
        symbols: false,
    });
    return password;
}
module.exports =
{
    loginUser,
    registerOrEditUser,
    registerOrEditExpert,
    logoutUser
}