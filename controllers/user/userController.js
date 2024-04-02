const authenticateUser = require('../../middleware/authenticateUser')
const User = require('../../models/user/userModel');
const Expert = require('../../models/legalExpert/expertModel');
const XUser = require('../../utils/constants/XUser');
const bcrypt = require('bcrypt');
const bcryptSalt = process.env.SALT_ROUNDS;

/** Check if user exists **/
findUser = async (req, res) => {
    try {
        // const userData = await authenticateUser(req);
        // const user = await User.findById(userData.userId);
        const user = await User.findById(req.body.userId);
        if (user == null) {
            return res.status(404).json({ msg: "User not found" });
        }
        return res.status(200).json(user);
    }
    catch (e) {
        console.log(e);
    }
}

/**  Delete a user account - Cascade delete (profile, ask expert queries, user) **/
deleteUserAccount = async (req, res) => {
    try {

        const userData = await authenticateUser(req, res);
        const passwordMatches = await comparePassword(res, userData, req.body.password);
        if (!passwordMatches) {
            return res.status(400).json({ msg: "Wrong password" });
        }
        else {
            const response = await User.deleteOne({ _id: userData.userId });
            if (response.deletedCount == 1)
                res
                    .clearCookie('token', {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'None',
                    })
                    .status(200)
                    .json({ msg: "Account deleted successfully" });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

/**  Fetch user details **/
userProfileData = async (req, res) => {
    try {
        var userResponse = '';
        const userData = await authenticateUser(req, res);
        const role = userData.role;
        if (role == XUser.ROLE_LEGALEXPERT) {
            userResponse = await Expert.findOne(
                { _id: userData.userId },
                'email firstName lastName role joinedOn displayPicture'
            );
        }
        else if (role == XUser.ROLE_CHILD || role == XUser.ROLE_ADMIN) {
            userResponse = await User.findOne(
                { _id: userData.userId },
                'email firstName lastName role joinedOn displayPicture'
            );
        }
        else {
            console.log("No role");
        }
        res.status(200).json({ userData: userResponse });
    }

    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

changeUserPassword = async (req, res) => {
    const userData = await authenticateUser(req, res);
    const userId = userData.userId;
    const oldPassword = req.body.oldPassword;

    const passwordMatches = await comparePassword(res, userData, oldPassword);
    if (!passwordMatches) {
        return res.status(400).json({ msg: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(Number(bcryptSalt));
    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    try {
        await User.updateOne(
            { _id: userId },
            { $set: { password: hashedPassword } },
            { new: true }  // returns modified doc
        );
        res.status(200).json({ error: "Password changed successfully" });
    }
    catch (e) {
        console.log(e);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const uploadProfilePicture = async (req, res) => {
    try {
        const userData = await authenticateUser(req, res);
        var displayPic = req.body.displayPicture;
        var updatedUserProfile;
        if (userData.role == XUser.ROLE_CHILD || userData.role == XUser.ROLE_ADMIN) {
            updatedUserProfile = await User.findOneAndUpdate(
                { _id: userData['userId'] },
                { $set: { displayPicture: displayPic } },
                { new: true }
            );
        }
        else if (userData.role == XUser.ROLE_LEGALEXPERT) {
            updatedUserProfile = await Expert.findOneAndUpdate(
                { _id: userData['userId'] },
                { $set: { displayPicture: displayPic } },
                { new: true }
            );
        }
        else{
            return res.status(404).json({ error: "Role not found"});
        }
        return res.status(200).json({ displayPicture: updatedUserProfile['displayPicture'] });
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

async function comparePassword(res, userData, password) {

    var userDoc = await User.findOne({ _id: userData.userId }, { password: 1 });
    if (!userDoc) {
        return res.status(404).json({ msg: 'User not found' });
    }
    var storedPassword = userDoc.password;
    const isPasswordCorrect = await bcrypt.compare(password, storedPassword);
    return isPasswordCorrect;
}

module.exports = {
    findUser,
    deleteUserAccount,
    userProfileData,
    changeUserPassword,
    uploadProfilePicture
};