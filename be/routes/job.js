const express = require('express');

const job = require('../controllers/job');
const { authorizeCompany, isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

router.get('/', job.getJobs)

router.use(isAuthenticated)
router.use(authorizeCompany);
router.post('/', job.postJob)

module.exports = router;