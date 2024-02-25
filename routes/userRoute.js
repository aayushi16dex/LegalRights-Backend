const express = require('express');
const router = express.Router();
const rbacMiddleware = require('../middleware/rbacMiddleware');
const multer = require('multer');
const photoMiddleware = multer({ dest: 'uploads' });

// Import controllers
const authController = require('../controllers/user/authController');
const resetPasswordController = require('../controllers/user/resetPasswordController');
const userController  = require('../controllers/user/userController');
const profileController = require('../controllers/user/profileController');

// Protect the route with RBAC middleware
router.post('/login', authController.loginUser);
router.post('/register', authController.registerOrEditUser);
router.put('/register/:id', authController.registerOrEditUser);
router.post('/logout', authController.logoutUser);
router.post('/resetPasswordRequest', resetPasswordController.resetPasswordRequest )
router.post('/resetPassword', resetPasswordController.resetPassword);
router.get('/findUser', userController.findUser);
router.delete('/deleteAccount', rbacMiddleware.checkPermission('delete_account'), userController.deleteUserAccount);
router.get('/profile', userController.userProfileData);
router.put('/uploadProfilePicture', rbacMiddleware.checkPermission('upload_profile_picture'), photoMiddleware.single('photo'), profileController.uploadProfilePicture);

module.exports = router;