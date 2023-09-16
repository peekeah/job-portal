const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const studentRouter = require('./routes/student');
const companyRouter = require('./routes/company');
const { errorHandler } = require('./utils/errorHandler');

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', async(req, res) => {
    res.send({
        status: true,
        data: 'job portal app'
    })
})


// routes
app.use('/api/student', studentRouter);
app.use('/api/company', companyRouter);


// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.DB_URL)
    .then(() => console.log('DB connection established'));

app.listen(PORT, () => console.log(`server listening on ${PORT}`));

