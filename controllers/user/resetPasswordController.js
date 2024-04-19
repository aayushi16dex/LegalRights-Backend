const app = require('express').Router();
const User = require('../../models/user/userModel');
const Expert = require('../../models/legalExpert/expertModel');
const Token = require('../../models/user/tokenModel')
const sendEmail = require('../../utils/email/sendEmail')
const bcrypt = require('bcrypt');   //password hashing
const bcryptSalt = process.env.SALT_ROUNDS;
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
app.use(cookieParser());

let userName;
let userEmail;
let userId;

// Reset Password request
resetPasswordRequest = async (req, res) => {
    var token;
    const userExist = await User.findOne({ email: req.body.email });
    const expertExist = await Expert.findOne({ email: req.body.email });

    if (!userExist && !expertExist) {
        return res.status(404).json({ msg: "User does not exist" });
    }

    // Handles user password reset request
    if (userExist) {
        token = await Token.findOne({ userId: userExist._id });
        setUserData(userExist);
    }

    // Handles legal expert password reset request
    else if (expertExist) {
        token = await Token.findOne({ userId: expertExist._id });
        setUserData(expertExist);
    }

    if (token) {
        token.deleteOne();
    }

    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

    await new Token({
        userId: userId,
        token: hash,
        createdAt: Date.now(),
    }).save();

    const link = `${process.env.SERVER_URL}/passwordReset/${resetToken}/${userId}`;

    try {
        await sendEmail(userEmail,
            "Password Reset Request",
            { name: userName, link: link, },
            "./template/requestResetPassword.handlebars",
            res);
        return res.status(200).json({ msg: "success", link });
    }
    catch (error) {
        console.log(error.message)
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

// Reset Password
resetPassword = async (req, res) => {
    let token = req.body.token;
    let userId = req.body.userId;
    let newPassword = req.body.password;
    let passwordResetToken = await Token.findOne({ userId: userId });

    if (!passwordResetToken) {
        return res.status(404).json({ msg: "Invalid or expired password reset token" });
    }

    const isValid = await bcrypt.compare(token, passwordResetToken.token);

    if (!isValid) {
        return res.status(404).json({ msg: "Invalid or expired password reset token" })
    }
    const hash = await bcrypt.hash(newPassword, Number(bcryptSalt));

    const userData = await User.findOne({ _id: userId });
    const expertData = await Expert.findOne({ _id: userId });

    if (!userData && !expertData){
        return res.status(404).json({msg: "No user found"});
    }

    if (userData) {
        setUserData(userData);
        try {
            await User.updateOne(
                { _id: userId },
                { $set: { password: hash } },
                { new: true }  // returns modified doc
            );
        }
        catch (e) {
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    else if (expertData) {
        setUserData(expertData);
        await Expert.updateOne(
            { _id: userId },
            { $set: { password: hash } },
            { new: true }  // returns modified doc
        );
    }

    else{
        console.log("No user found");
    }

    await sendEmail(
        userEmail,
        "Password Reset Successfully",
        { name: userName },
        "./template/ResetPassword.handlebars",
        res
    );

    await passwordResetToken.deleteOne();
    return res.status(200).json({ msg: "success"});
}

// Function to set user data
function setUserData (userData){
    userId = userData._id;
    userName = userData.firstName;
    userEmail = userData.email;
    // Check if last name exists and is not an empty string
    if (userData.lastName && userData.lastName.trim() !== "") {
        userName += " " + userData.lastName;
    }
}
module.exports = {
    resetPasswordRequest,
    resetPassword
};