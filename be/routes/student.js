const express = require('express');
const student = require('../controllers/student');

const router = express.Router();

router.post('/create', student.create)


module.exports = router;