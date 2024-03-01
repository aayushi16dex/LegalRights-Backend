const express = require('express');
const router = express.Router();
const rbacMiddleware = require('../middleware/rbacMiddleware');
const multer = require('multer');
const videoMiddleware = multer({ dest: 'uploads' });
const photoMiddleware = multer({ dest: 'uploads' });

// Import controller

const a_countController = require('../controllers/admin/a_countController');
const a_legalExpertController = require('../controllers/admin/a_legalExpertController');
const a_organisationController = require('../controllers/admin/a_organisationController')
const a_userController = require('../controllers/admin/a_userController');
const a_legalContentController = require('../controllers/admin/a_legalContentController');
const authController = require('../controllers/user/authController');
// Protect the route with RBAC middleware

// Expert
router.post('/addExpert', rbacMiddleware.checkPermission('add_expert'), authController.registerOrEditExpert);
router.put('/editExpert/:id', rbacMiddleware.checkPermission('edit_expert'), authController.registerOrEditExpert);
router.put('/changeStatus/:id',rbacMiddleware.checkPermission('change_expert_status'),  a_legalExpertController.changeExpertStatus);
router.post('/addProfession', rbacMiddleware.checkPermission('add_profession'), a_legalExpertController.addProfession);
router.get('/fetchProfession', rbacMiddleware.checkPermission('fetch_professions'),  a_legalExpertController.fetchProfessions);
router.post('/addLanguage', rbacMiddleware.checkPermission('add_language'), a_legalExpertController.addLanguage);
router.get('/fetchLanguage', rbacMiddleware.checkPermission('fetch_languages'), a_legalExpertController.fetchLanguages);
router.post('/addExpertise', rbacMiddleware.checkPermission('add_expertise'), a_legalExpertController.addExpertise);
router.get('/fetchExpertise', rbacMiddleware.checkPermission('fetch_expertise'), a_legalExpertController.fetchExpertise);
router.get('/fetchStates', rbacMiddleware.checkPermission('fetch_states'), a_legalExpertController.fetchStates);
router.get('/fetchExperts/:page?', rbacMiddleware.checkPermission('fetch_experts_by_admin'), a_legalExpertController.fetchExpertsListForAdmin);


// Count 
router.get('/fetchHomePageCount', rbacMiddleware.checkPermission('count_user_legalExpert_organisation'), a_countController.fetchCount);

// User
router.get('/fetchAllUser', rbacMiddleware.checkPermission('fetch_users_list'), a_userController.fetchUserList);
router.get('/fetchUser/:id', rbacMiddleware.checkPermission('fetch_user'), a_userController.fetchUser);

// Organisation
router.post('/organisation', rbacMiddleware.checkPermission('add_edit_organisation'), photoMiddleware.single('organisationImage'), a_organisationController.addOrEditOrganisation);
router.put('/organisation/:id', rbacMiddleware.checkPermission('add_edit_organisation'), photoMiddleware.single('organisationImage'), a_organisationController.addOrEditOrganisation);
router.delete('/deleteOrganisation/:id', rbacMiddleware.checkPermission('delete_organisation'), a_organisationController.deleteOrganisation);

// Legal content
router.post('/section', rbacMiddleware.checkPermission('add_edit_legal_section'), a_legalContentController.addOrEditSection);
router.put('/section/:id', rbacMiddleware.checkPermission('add_edit_legal_section'), a_legalContentController.addOrEditSection);
router.delete('/deleteSection/:id', rbacMiddleware.checkPermission('delete_section'), a_legalContentController.deleteSection );
router.put(
    '/subSection/:id',
    rbacMiddleware.checkPermission('edit_legal_subSection'),
    videoMiddleware.fields([
        { name: 'introductionVideo' },
        { name: 'contentVideo1' },
        { name: 'narratorVideo' },
        { name: 'contentVideo2' }
    ]),
    a_legalContentController.editSubSection
);

module.exports = router;

