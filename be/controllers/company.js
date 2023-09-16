const jwt = require('jsonwebtoken');

const company = require('../models/company');
const { ErrorResponse } = require('../utils/errorHandler');
const { comparePassword, hashPassword } = require('../utils/bcrypt');

exports.createCompany = async (req, res, next) => {
    try {

        const existCompany = await company.findOne({ email: req.body.email });

        if (existCompany) throw new ErrorResponse('Company already exists', 403);

        if(!req.body.password) throw new ErrorResponse('password is required', 400);

        req.body.password = hashPassword(req.body.password);

        await new company(req.body).save();

        res.send({
            status: true,
            data: 'successfully create company'
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