const jwt = require('jsonwebtoken');

const company = require('../models/company');
const { ErrorResponse } = require('../utils/errorHandler');
const { comparePassword, hashPassword } = require('../utils/bcrypt');
const job = require('../models/job');

exports.createCompany = async (req, res, next) => {
    try {

        const existCompany = await company.findOne({ email: req.body.email });

        if (existCompany) throw new ErrorResponse('Company already exists', 403);

        if(!req.body.password) throw new ErrorResponse('password is required', 400);

        req.body.password = await hashPassword(req.body.password);
        
        await new company(req.body).save();

        const token = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET);

        res.send({
            status: true,
            data: { token }
        })

    } catch (err) {
        next(err);
    }
}

exports.login = async(req, res, next) => {

    try {

        const { email, password } = req.body;

        if(!email || !password) throw new ErrorResponse("Email & password must be provided", 400);

        const existCompany = await company.findOne({ email: req.body.email });

        if(!existCompany) throw new ErrorResponse('Company not found', 403);

        const isMatch = await comparePassword(password, existCompany.password);

        if(!isMatch) throw new ErrorResponse('Password mismatch', 403);

        const token = jwt.sign({ email: existCompany.email }, process.env.JWT_SECRET);

        res.send({
            status: true,
            data: { token }
        })

    } catch (err) {
        next(err);
    }
}

exports.getProfile = async(req, res, next) => {
    try {
        res.send({
            status: true,
            data: req.body.companyData
        })
    } catch (err) {
        next(err);
    }
}

exports.updateProfile = async(req, res, next) => {
    try {

        if(req.body.name){
            delete req.body.name;
        }

        if(req.body.password){
            req.body.password = await hashPassword(req.body.password);
        }

        if(req.body.founding_year){
            delete req.body.founding_year;
        }

        const response = await company.findOneAndUpdate({ email: req.body.tokenData.email }, req.body, {
            new: true
        });

        res.send({
            status: true,
            data: response
        })

    } catch (err) {
        next(err);
    }
}

exports.postedJobs = async(req, res, next) => {
    try {
        const result = await job.find({ company: req.body.companyData._id }).populate('company')
        res.send({
            status: true,
            data: result
        })
    } catch (err) {
        next(err);
    }
}