const express = require('express');

const company = require('../controllers/company');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.post('/login', company.login);
router.post('/create', company.createCompany)

router.use(isAuthenticated);
router.post('/profile', company.updateProfile);

module.exports = router;