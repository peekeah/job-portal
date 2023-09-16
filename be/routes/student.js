const express = require('express');

const auth = require('../middlewares/auth');
const student = require('../controllers/student');

const router = express.Router();

router.post('/login', student.login);
router.post('/create', student.create);

router.use(auth.isAuthenticated)
router.post('/profile', student.updateProfile);


module.exports = router;