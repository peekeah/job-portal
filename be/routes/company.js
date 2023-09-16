const express = require('express');
const company = require('../controllers/company');

const router = express.Router();

router.post('/login', company.login);
router.post('/create', company.createCompany)


module.exports = router;