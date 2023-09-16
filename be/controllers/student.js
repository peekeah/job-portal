const student = require("../models/student");
const { ErrorResponse } = require("../utils/errorHandler");

exports.create = async(req, res, next) => {
    try {

        const existStudent = await student.findOne({ email: req.body.email });

        if(existStudent){
            throw new ErrorResponse('Student already exists', 403);
        }

        const response = new student(req.body);
        await response.save();

        res.send({
            status: true,
            data: 'successfully created user'
        })

    } catch (err) {
        next(err);
    }
}