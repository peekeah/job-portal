const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(cors());

app.get('/', async(req, res) => {
    res.send({
        status: true,
        data: 'job portal app'
    })
})


const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.DB_URL)
    .then(() => console.log('DB connection established'));

app.listen(PORT, () => console.log(`server listening on ${PORT}`));

