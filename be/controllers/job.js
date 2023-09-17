const company = require("../models/company");
const job = require("../models/job");
const student = require("../models/student");
const { ErrorResponse } = require("../utils/errorHandler");

exports.getJobs = async (req, res, next) => {
    try {
        const jobs = await job.find().populate('company', '-password');

        res.send({
            status: true,
            data: jobs
        });
    } catch (err) {
        next(err);
    }
}

exports.postJob = async (req, res, next) => {
    try {

        const companyData = await company.findOne({ email: req.body.tokenData.email });

        req.body.company = companyData._id;

        await new job(req.body).save();
        res.send({
            status: true,
            data: 'successfully posted job'
        })

    } catch (err) {
        next(err);
    }
}

exports.applyJob = async (req, res, next) => {
    try {
        const jobId = req.params['id'];
        const studentId = req.body.studentData._id;

        const found = await job.findOne({
            _id: jobId,
            $or: [
                { 'applicants.applied': { $in: studentId } },
                { 'applicants.shortlisted': { $in: studentId } },
                { 'applicants.hired': { $in: studentId } },
            ]
        });

        if (found) {
            throw new ErrorResponse('you already applied for this job');
        }

        await job.findByIdAndUpdate(jobId, { $push: { 'applicants.applied': studentId } });
        await student.findByIdAndUpdate(studentId, { $push: { 'applied_jobs': { job_id: jobId } } })

        res.send({
            status: true,
            data: 'successfully applied for the job'
        });
    } catch (err) {
        next(err);
    }
}


exports.getAppliedStudents = async (req, res, next) => {
    try {

        const jobId = req.params['id'];

        if (!jobId) throw new ErrorResponse('job id not provided', 400);

        const studentsList = await job.findOne({ _id: jobId })
            .populate('applicants.applied', '-applied_jobs')
            .populate('applicants.shortlisted')
            .populate('applicants.hired')

        if (!studentsList) throw new ErrorResponse('Job does not exist', 403);

        res.send({
            status: true,
            data: studentsList.applicants || []
        })

    } catch (err) {
        next(err);
    }
}


exports.selectCandidate = async (req, res, next) => {
    try {
        const { jobId, studentId, applicantStatus } = req.body;

        if (!jobId || !studentId || !applicantStatus) {
            throw new ErrorResponse('missing mandatory field');
        }

        if (!['applied','shortlisted', 'hired'].includes(applicantStatus)) {
            throw new ErrorResponse('wrong value for applicantStatus', 400);
        }

        const found = await job.findOne({
            _id: jobId,
            $or: [
                { 'applicants.applied': { $in: studentId } },
                { 'applicants.shortlisted': { $in: studentId } },
                { 'applicants.hired': { $in: studentId } },
            ]
        });

        if (!found) {
            throw new ErrorResponse('candidate not found', 403);
        }


        await job.updateOne(
            { _id: jobId },
            {
                $pull: {
                    'applicants.applied': studentId,
                    'applicants.shortlisted': studentId,
                    'applicants.hired': studentId,
                },
            });

        const schemaField = `applicants.${applicantStatus}`;
        await job.findByIdAndUpdate(jobId, { $push: { [schemaField]: studentId } });

        await student.findOneAndUpdate({
            _id: studentId,
            'applied_jobs.job_id': jobId,
        },
            {
                $set: {
                    'applied_jobs.$.status': applicantStatus,
                },
            },
            { new: true },
        )

        res.send({
            status: true,
            data: 'successfully updated status'
        })

    } catch (err) {
        next(err);
    }
}