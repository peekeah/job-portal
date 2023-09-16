const company = require('../models/company');
const { ErrorResponse } = require('../utils/errorHandler');

exports.createCompany = async (req, res, next) => {
    try {

        const existCompany = await company.findOne({ email: req.body.email });

        if (existCompany) throw new ErrorResponse('Company already exists', 403);

        await new company(req.body).save();

        res.send({
            status: true,
            data: 'successfully create company'
        })

    } catch (err) {
        next(err);
    }
}