const express = require('express');

const auth = require('../middlewares/auth');
const student = require('../controllers/student');

const router = express.Router();

router.post('/login', student.login);
router.post('/signup', student.create);

router.use(auth.isAuthenticated);
router.use(auth.authorizeStudent);
router.get('/profile', student.getProfile);
router.post('/profile', student.updateProfile);
router.get('/applied-jobs', student.getAppliedJobs);


module.exports = router;