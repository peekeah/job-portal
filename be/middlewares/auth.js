const jwt = require('jsonwebtoken');

const { ErrorResponse } = require('../utils/errorHandler');
const company = require('../models/company');

exports.isAuthenticated = async (req, _res, next) => {
    const bearerHeader = req.headers['authorization']
    
    try {
        if (!bearerHeader || bearerHeader === ''){
            throw new ErrorResponse('token not found', 400);
        }
        
        const token = bearerHeader.split(' ')[1];

        req.body.tokenData = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        next(err);
    }
}


exports.authorizeCompany = async(req, res, next) => {
    
    try {
        
        const tokenData = req.body.tokenData;
        if(!tokenData) throw new ErrorResponse('you are not authorized', 401);

        const existCompany = await company.findOne({ email: tokenData.email })

        if(!existCompany) throw new ErrorResponse('you are not authorized', 401);

        next();


    } catch (err) {
        next(err);
    }
}

exports.authorizeStudent = async(req, res, next) => {
    
    try {
        
        const tokenData = req.body.tokenData;
        if(tokenData) throw new ErrorResponse('you are not authorized', 401);

        const existStudent = await student.findOne({ email: tokenData.email })

        if(!existStudent) throw new ErrorResponse('you are not authorized', 401);

        next();

    } catch (err) {
        next(err);
    }
}