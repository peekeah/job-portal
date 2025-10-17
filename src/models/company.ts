import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: 'string',
        require: true
    },
    founding_year: {
        type: 'number',
        required: true
    },
    company_type: {
        type: 'string',
        required: true
    },
    email: {
        type: 'string',
        required: true
    },
    password: {
        type: 'string',
        required: true,
        // select: false
    },
    contact_no: {
        type: 'string',
        required: true
    },
    website: {
        type: 'string',
    },
    state: {
        type: 'string',
        required: true
    },
    size: {
        type: 'string',
        enum: ['1-10', '10-50', '50-100', '100+']
    },
    bio: {
        type: 'string'
    }
});


export default mongoose.model('company', companySchema);;