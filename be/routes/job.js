const express = require('express');

const job = require('../controllers/job');
const { authorizeCompany, isAuthenticated, authorizeStudent } = require('../middlewares/auth');

const router = express.Router();

router.get('/', job.getJobs)

router.post('/apply/:id', [isAuthenticated, authorizeStudent], job.applyJob);
router.get('/applied-students/:id', [isAuthenticated, authorizeStudent], job.getAppliedStudents)

router.post('/select-candidate', [isAuthenticated, authorizeCompany], job.selectCandidate);
router.post('/', [isAuthenticated, authorizeCompany], job.postJob)

module.exports = router;