class ErrorResponse extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

const errorHandler = (err, _req, res, next) => {
    res.status(err.status || 500).json({
        status: false,
        error: err.message || 'Internal Server Error',
    })
}

module.exports = {
    ErrorResponse,
    errorHandler
}