const app = require('express').Router();
const User = require('../../models/user/userModel');
const Expert = require('../../models/legalExpert/expertModel')
const UserProfile = require('../../models/user/userProfileModel')
const authenticateUser = require('../../middleware/authenticateUser')
const XUser = require('../../utils/constants/XUser')
const bcrypt = require('bcrypt');   //password hashing
const bcryptSalt = process.env.SALT_ROUNDS;
const defaultExpertPassword = process.env.LEGAL_EXPERT_DEFAULT_PASSWORD;
const jwt = require('jsonwebtoken');   //authentication

const cookieParser = require('cookie-parser');
app.use(cookieParser());

/** Role and password cannot be updated*/

// Register or edit user or legal expert   
registerOrEditUser = async (req, res) => {
    var role;
    var isExisting = false;
    var userPassword;
    var salt;
    var hashedPassword;
    var isEdit = req.params.id ? true : false;

    try {
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
            else {
                role = userData.role;
            }
        }
        // Handles register
        if (req.body.role == XUser.ROLE_CHILD && !isEdit) {
            role = XUser.ROLE_CHILD
            isExisting = await User.findOne({ email: req.body.email });
            userPassword = req.body.password;
        }
        else if (req.body.role == XUser.ROLE_LEGALEXPERT && !isEdit) {
            role = XUser.ROLE_LEGALEXPERT
            isExisting = await Expert.findOne({ email: req.body.email });
            userPassword = defaultExpertPassword;
        }

        // In case of new registration request, if user already exists 
        if (isExisting && !isEdit) {
            return res.status(409).json({ msg: 'Email has already been registered' });
        }

        // Create a user document with common attributes of edit, register of expert and child
        const userData = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        };

        // Register operation
        if (!isEdit) {
            salt = await bcrypt.genSalt(Number(bcryptSalt));
            hashedPassword = await bcrypt.hash(userPassword, salt);
            userData.password = hashedPassword,
            userData.role = req.body.role,
            userData.joinedOn = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        }

        if (role == XUser.ROLE_CHILD) {
            if (isEdit)
                editChild(userData, req, res)
            else
                registerChild(userData, req, res);
        }

        // Add attributes specific to legal experts if the role is 'legal expert'
        else if (role == XUser.ROLE_LEGALEXPERT) {
            userData.languagesKnown = req.body.languagesKnown;
            userData.experienceYears = req.body.experienceYears;
            userData.expertise = req.body.expertise;
            userData.profession = req.body.profession;
            userData.state = req.body.state;

            if (isEdit)
                editExpert(userData, req, res)
            else
                registerExpert(userData, req, res);

        }
        else {
            return res.status(400).json({ msg: 'Invalid role' });
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
const createToken = async (userId, role) => {
    const expiresIn = 60 * 60 * 24 * 30; // 30 days in seconds
    const payload = {
        role: role,
        userId: userId
    }
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
    return token;
}

// function for creating user profile, general user setting
const createProfile = async (userId) => {
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
const registerChild = async (userData, req, res) => {
    try {
        const userDoc = await User.create(userData);
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
const editChild = async (userData, req, res) => {
    try {
        const userId = req.params.id;
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId },
            userData,
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
const registerExpert = async (userData, req, res) => {
    try {
        const expertDoc = await Expert.create(userData);
        await expertDoc.save();

        const token = await createToken(expertDoc._id, expertDoc.role);
        const { password, ...others } = expertDoc._doc;

        // await createProfile(userDoc);
        return res
            .cookie('token', token, {
                httpOnly: true,  // make the cookie accessible only through HTTP requests
                secure: true,    // ensure the cookie is only sent over HTTPS connection
                sameSite: 'None'
            })
            .status(201).json({ userData: others, token, msg: 'Successfully registered' });
    }
    catch (error) {
        if (error.message.startsWith('Invalid')) {
            // Handle the validation error
            res.status(400).json({ error: error.message });
        } else {
            // Handle other errors
            console.error(error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

// function to handle expert updation
const editExpert = async (userData, req, res) => {
    try {
        const expertId = req.params.id;
        const updatedExpert = await Expert.findOneAndUpdate(
            { _id: expertId },
            userData,
            { new: true, runValidators: true } // ensures validation is run
        );

        const { password, ...others } = updatedExpert._doc;

        return res.status(200).json({ userData: others, msg: 'Legal expert profile updated successfully' });
    }
    catch (error) {
        if (error.message.startsWith('Invalid')) {
            // Handle the validation error
            res.status(400).json({ error: error.message });
        } else {
            // Handle other errors
            console.error(error.message);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

// checks if requested new email is not already there in DB
const isRequestedNewEmailPresent = async (email, userData) => {
    if (userData.role == XUser.ROLE_CHILD) {
        const response = await User.findOne({ email, _id: { $ne: userData.userId } });
        return response ? true : false;
    }
    else if (userData.role == XUser.ROLE_LEGALEXPERT) {
        const response = await Expert.findOne({ email, _id: { $ne: userData.userId }});
        return response ? true : false;
    }
    else {
        console.log("No role found");
        return false;
    }
}

module.exports =
{
    loginUser,
    registerOrEditUser,
    logoutUser
}
