const express = require('express');
var cors = require('cors')

require('dotenv').config();
const cookieParser = require("cookie-parser")
const PORT = process.env.PORT;
const { connection } = require('./db');

const app = express();
app.use(express.json())
app.use(cors())
app.use(cookieParser())


//  Router ;
const { userRoute } = require("./routes/User.route")

app.use("/user", userRoute);


app.get("/", (req, res) => {
    res.send({ "messege": "Homepage" })

})


//  Database connection
app.listen(PORT, async () => {
    try {
        await connection;
        console.log("Server is listening at", PORT)
    } catch (error) {
        console.log(error)
    }
})



