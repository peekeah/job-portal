const express = require('express');
const company = require('../controllers/company');

const router = express.Router();

router.post('/create', company.createCompany)


module.exports = router;