const express = require('express');

const company = require('../controllers/company');
const { isAuthenticated, authorizeCompany } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', company.login);
router.post('/signup', company.createCompany)

router.use([isAuthenticated, authorizeCompany]);
router.post('/profile', company.updateProfile);

module.exports = router;