const company = require("../models/company");
const job = require("../models/job");

exports.getJobs = async(req, res, next) => {
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

exports.postJob = async(req, res, next) => {
    try {

        const companyData = await company.findOne({ email: req.body.tokenData.email});

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