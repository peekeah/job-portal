import mongoose from 'mongoose';

const applicantsSchema = new mongoose.Schema({
    applied: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "student"
        },
    ],
    shortlisted: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "student"
        },
    ],
    hired: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "student"
        },
    ]
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
    applicants: applicantsSchema
});


export default mongoose.model('job', jobSchema);