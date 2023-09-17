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

const appliedJobsSchema = new mongoose.Schema({
    job_id: {
        type: mongoose.Schema.ObjectId,
        ref: "job"
    },
    status: {
        type: 'string',
        enum: ['applied', 'shortlisted', 'hired'],
        default: 'applied'
    }
});

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
        required: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: "Please enter a valid email"
        },
        required: [true, "Email required"]
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
    },
    applied_jobs: [appliedJobsSchema]
});


module.exports = mongoose.model('student', studentSchema);;