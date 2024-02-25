const express = require('express');
const router = express.Router();
const rbacMiddleware = require('../middleware/rbacMiddleware');

// Import controller
const legalContentController = require('../controllers/legalContent/contentController');

router.get('/fetchSections', rbacMiddleware.checkPermission('fetch_section_list'), legalContentController.fetchSectionsList );
router.get('/fetchSection/:id', rbacMiddleware.checkPermission('fetch_section'), legalContentController.fetchSubSection );

module.exports = router;