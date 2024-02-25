const User = require('../../models/user/userModel')

// Fetch list of all User
fetchUserList = async (req, res) => {
    const [userList, totalCount] = await Promise.all([
        User.find()
        .select('firstName lastName email displayPicture joinedOn'),
        User.countDocuments(),
    ]);
    res.status(200).json({ totalCount, userList });
}

// Fetch data of a particular User
fetchUser = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    fetchUser,
    fetchUserList
}