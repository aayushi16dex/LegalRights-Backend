const authenticateUser = require('../../middleware/authenticateUser')
const User = require('../../models/user/userModel');
const Expert = require('../../models/legalExpert/expertModel');
const XUser = require('../../utils/constants/XUser');

// Check if user exists
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

// Delete a user account - Cascade delete (profile, ask expert queries, user)
deleteUserAccount = async (req, res) => {
    try{
    // const userData = await authenticateUser(req, res);
    var id = req.params.id;
    // const response = await User.deleteOne({ _id: userData.userId });
    const response = await User.deleteOne({ _id: id });
    if (response.deletedCount == 0)
        return res.status(404).json({ msg: 'User not found' });
    else
        res
    // .clearCookie('token', {
    //         httpOnly: true,
    //         secure: true,
    //         sameSite: 'None',
    //     })
            .status(200)
            .json("Successfully deleted");
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// Fetch user details
userProfileData = async (req, res) => {
    try {
        var userResponse = '';
        const userData = await authenticateUser(req, res);
        const role = userData.role;
        if (role == XUser.ROLE_LEGALEXPERT) {
            userResponse = await Expert.findOne(
                { _id: userData.userId },
                'firstName lastName role joinedOn displayPicture'
            );
        }
        else if (role == XUser.ROLE_CHILD || role == XUser.ROLE_ADMIN) {
            userResponse = await User.findOne(
                { _id: userData.userId },
                'firstName lastName role joinedOn displayPicture'
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

module.exports = {
    findUser,
    deleteUserAccount,
    userProfileData
};