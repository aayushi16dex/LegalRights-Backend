const jwt = require('jsonwebtoken');
const User = require('../models/user/userModel');
const Expert = require('../models/legalExpert/expertModel')
const XUser = require('../utils/constants/XUser');
// Fetch token from Cookie 
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
app.use(cookieParser());

async function authenticateUser(req, res) {
    var userExist;
    var expertExist;
    var tokenValue = '';

   if (req.headers.cookie){
    // Cookie
    const tokenString = req.headers.cookie;
    tokenValue = tokenString ? tokenString.split('=')[1].trim() : '';
   }
    // Authorization token
    else{
        const authorizationHeader = req.headers.authorization;
        tokenValue = authorizationHeader ? authorizationHeader.replace('Bearer ', '').trim() : '';
    }

    if (!tokenValue) {
        return { error: 'Authentication failed. Please log in again.' };
    }
    const userData = await getUserData(tokenValue);
    if (userData.error) {
        return { error: userData.error };
    }
    const userId = userData.userId;
    const role = userData.role;
    if (role == XUser.ROLE_CHILD || role == XUser.ROLE_ADMIN) {
        userExist = await User.findById(userId);
    }
    else if (role == XUser.ROLE_LEGALEXPERT) {
        expertExist = await Expert.findById(userId);
    }
    else {
        return { error: 'No role found' };
    }
    if (!userExist && !expertExist) {
        return { error: 'Invalid user' };
    }
    else {
        return userData;
    }
}

async function getUserData(tokenValue) {
    try {
        return await new Promise((resolve, reject) => {
            jwt.verify(tokenValue, process.env.JWT_SECRET, {}, async (err, userData) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(userData);
                }
            });
        });
    }

    catch (error) {
        throw error;
    }
}
module.exports = authenticateUser;