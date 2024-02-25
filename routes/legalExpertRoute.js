const express = require('express');
const router = express.Router();
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Import controller

const expertController = require('../controllers/legalExpert/expertController');
const fetchExpertController = require('../controllers/legalExpert/fetchExpertController');

// Protect the route with RBAC middleware
router.get('/fetch', rbacMiddleware.checkPermission('fetch_experts_list_by_user'), fetchExpertController.fetchExpertsListForUser);
router.get('/fetch/:id',rbacMiddleware.checkPermission('fetch_expert'),  fetchExpertController.fetchExpert);

router.patch('/changePassword', rbacMiddleware.checkPermission('change_expert_password'), expertController.changePassword);
router.get('/fetchUserQueries', rbacMiddleware.checkPermission('fetch_user_queries'), expertController.fetchUnansweredUserQueries);
router.get('/fetchAnsweredUserQueries', rbacMiddleware.checkPermission('fetch_answered_user_queries'), expertController.fetchAnsweredUserQueries);
router.patch('/answerQuery/:id', rbacMiddleware.checkPermission('answer_query'), expertController.answerQuery);

router.get('/fetchCount', rbacMiddleware.checkPermission('fetch_query_count'), expertController.fetchQueryCount)

module.exports = router;
