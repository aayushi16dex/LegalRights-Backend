const profileController = require('express').Router();
const UserProfile = require('../../models/user/userProfileModel');
const imageDownloader = require('image-downloader');
const path = require('path');
const uploadDir = path.resolve(path.join(__dirname, '..'));
const fs = require('fs');
const authenticateUser = require('../../middleware/authenticateUser')
const User = require('../../models/user/userModel')

// Add photo-by-link - ADMIN (TO BE DONE)
profileController.post('/upload-by-link', async (req, res) => {
    try {
        const imgName = "photo" + Date.now() + ".jpg";
        const { link } = req.body;
        await imageDownloader.image({
            url: link,
            dest: path.join(uploadDir, 'uploads', imgName)
        });
        res.json(imgName);
    }
    catch (e) {
        res.json("Some error occured");
    }
})

// Add display picture by user
const uploadProfilePicture = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const userData = await authenticateUser(req, res);
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

    User.findOneAndUpdate(
        { userId: userData._id },
        { $set: { displayPicture: newPath } },
        { new: true }
    )
        .then((updatedUserProfile) => {
            if (updatedUserProfile) {
                res.status(200).json({ msg: "Your display picture has been successfully updated" });
            } else {
                console.log(error)
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })
        .catch((error) => {
            console.log(error.message)
            return res.status(500).json({ error: "Internal Server Error" });
        });
};

module.exports = {
    uploadProfilePicture
};