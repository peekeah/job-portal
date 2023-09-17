const jwt = require('jsonwebtoken');

const student = require("../models/student");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { ErrorResponse } = require("../utils/errorHandler");

exports.create = async(req, res, next) => {
    try {

        const existStudent = await student.findOne({ email: req.body.email });

        if (existStudent) throw new ErrorResponse('Student already exists', 403);

        if(!req.body.password) throw new ErrorResponse('password is required', 400);

        req.body.password = await hashPassword(req.body.password);

        const response = new student(req.body);
        await response.save();

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

        const existStudent = await student.findOne({ email: req.body.email });

        if(!existStudent) throw new ErrorResponse('Student not found', 403);

        const isMatch = await comparePassword(password, existStudent.password);

        if(!isMatch) throw new ErrorResponse('Password mismatch', 403);

        const token = jwt.sign({ email: existStudent.email }, process.env.JWT_SECRET);

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
            data: req.body.studentData
        });
    } catch (err) {
        next(err);
    }
}

exports.updateProfile = async(req, res, next) => {
    try {

        if(req.body.password){
            req.body.password = await hashPassword(req.body.password);
        }

        const response = await student.findOneAndUpdate({ email: req.body.tokenData.email }, req.body, {
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