const student = require("../models/student")

exports.create = async(req, res, next) => {
    try {

        const existStudent = await student.findOne({ email: req.body.email });

        if(existStudent){
            return res.status(403).send({
                status: false,
                error: 'student already exist'
            })
        }

        const response = new student(req.body);
        await response.save();

        res.send({
            status: true,
            data: 'successfully created user'
        })

    } catch (err) {
        res.status(500).send({
            status: false,
            error: err.message
        })
    }
}