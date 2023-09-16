const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    name: {
        type: 'string',
        require: true
    },
    branch: {
        type: 'string',
        require: true
    },
    joining_year: {
        type: 'number',
        require: true
    },
})

const studentSchema = new mongoose.Schema({
    name: {
        type: 'string',
        require: true
    },
    mobile: {
        type: 'number',
        required: true
    },
    email: {
        type: 'string',
        required: true
    },
    password: {
        type: 'string',
        required: true
    },
    profile_pic: {
        type: 'string',
    },
    college: collegeSchema,
    interest: [String],
    skills: {
        type: [String],
        validate: {
            validator: function (v) {
                return v.length > 4
            },
            message: 'Minimum 5 skills required'
        }
    },
    bio: {
        type: 'string'
    }
});


module.exports = mongoose.model('student', studentSchema);;