const jwt = require('jsonwebtoken');

const { ErrorResponse } = require('../utils/errorHandler')

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

