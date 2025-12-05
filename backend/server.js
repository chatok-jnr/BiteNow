const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});
const app = require('./app');

const DB = (process.env.DATBASE || '').replace('<PASSWORD>', process.env.DATABASE_PASSWORD || '');

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running in port No = ${PORT}`);
})