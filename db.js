const mongoose = require("mongoose");
require('dotenv').config();
const mongoURL = process.env.mongoURL;
const connection = mongoose.connect("mongodb+srv://pkthapliyal:pankajkr@cluster0.l1f5yob.mongodb.net/RBAC?retryWrites=true&w=majority");


module.exports = { connection }
