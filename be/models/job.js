const mongoose = require('mongoose');

const Applicants = new mongoose.Schema({
    applied: {
        type: mongoose.Schema.ObjectId,
        ref: "company"
    },
    shortlisted: {
        type: mongoose.Schema.ObjectId,
        ref: "company"
    },
    hired: {
        type: mongoose.Schema.ObjectId,
        ref: "company"
    }
})

const jobSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.ObjectId,
        ref: "company",
        required: [true, 'company is required']
        
    },
    job_role: {
        type: 'string',
        require: true
    },
    description: {
        type: 'string',
        require: true
    },
    ctc: {
        type: 'number',
        require: true
    },
    stipend: {
        type: 'number',
        require: true
    },
    location: {
        type: 'string',
        require: true
    },
    skills_required: {
        type: [String],
        require: true
    },
    applicants: Applicants
});


module.exports = mongoose.model('job', jobSchema);