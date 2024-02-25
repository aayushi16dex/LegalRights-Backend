const express = require('express');
const router = express.Router();
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Import controller
const askExpertController = require('../controllers/askExpert/askExpertController');

// Protect the route with RBAC middleware
// Only for users
router.post('/raiseQuery', rbacMiddleware.checkPermission('raise_query'), askExpertController.raiseQuery );
router.get('/fetchQueries', rbacMiddleware.checkPermission('fetch_user_query') ,askExpertController.fetchUserQuery);

module.exports = router;