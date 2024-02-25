const express = require('express');
const router = express.Router();
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Import controller
const organisationController = require('../controllers/organisation/organisationController');

// Protect the route with RBAC middleware
router.get('/fetch', rbacMiddleware.checkPermission('fetch_organisations_list'), organisationController.fetchOrganisationsList);
router.get('/fetch/:id', rbacMiddleware.checkPermission('fetch_organisation'), organisationController.fetchOrganisation);

module.exports = router;