const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
var cookie = require('cookie');
// const axios = require('axios')

require('dotenv').config()
const secretKey = process.env.secretKey;
const userRoute = express.Router();
const { UserModel } = require("../models/User.model")


userRoute.post("/register", async (req, res) => {
    const { name, email, role, password } = req.body;
    const isUser = await UserModel.findOne({ email: email })
    if (isUser) {
        return res.status(401).send({ "error": "user is already registered !" })
    }
    if (email && name && role && password) {
        try {
            bcrypt.hash(password, 5, async (err, hash) => {
                user = UserModel({ name, email, password: hash, role })
                await user.save()
                res.send({ "messege": "one user has been registered !" })
            })
        } catch (error) {
            return res.status(401).send({ "error": error.messege })
        }
    }
    else {
        res.status(401).send({ "error": "Please fill all details." })
    }
})


userRoute.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(401).send({ "err": "Wrong credentials !" })
        }
        bcrypt.compare(password, user.password, async (err, result) => {
            if (result) {
                const token = jwt.sign({ role: user.role, email: user.email }, secretKey, { expiresIn: "1h" });
                return res.status(200).send({ "message": "login successfully", token })
            }
            else if (err) {
                return res.status(401).send({ "err": err.messege })
            }
        })
    } catch (error) {
        return res.status(401).send({ "err": error.messege })
    }
})

//  check token 
const haveToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(404).send({ "error": "Invailed token" })
    }
    tokenValue = token.replace("Bearer ", "")
    jwt.verify(tokenValue, secretKey, async (err, decoded) => {
        if (decoded) {
            req.user = decoded
            next()
        }
        else if (err) {
            return res.status(404).send({ "error": err.message })
        }
    })

}

// Define roles and permissions
const roles = {
    superAdmin: {
        permissions: ['get', 'post', 'delete']
    },
    admin: {
        permissions: ['post', 'delete', "get"]
    },
    user: {
        permissions: ['get']
    }
};

// Define middleware function to check user roles and permissions
function checkRole(role) {
    return function (req, res, next) {
        if (req.user && roles[req.user.role] && roles[req.user.role].permissions.includes(req.method.toLowerCase())) {
            return next();
        } else {
            return res.status(403).send('Forbidden');
        }
    };
}



//  user details 
userRoute.get("/profile", haveToken, async (req, res) => {
    const isUser = req.user
    const user = await UserModel.findOne({ email: isUser.email })
    return res.status(200).send({ "User Profile": `Name :${user.name}, Role :${user.role}, Email :${user.email}` })
})


//  user accsess

// {
//     "name": "Pankaj Thapliyal",
//         "password": "123",
//             "email": "pk33360@gmail.com",
//                 "role": "superAdmin"
// }

//  all details of SUPER ADMIN----------------->> 
userRoute.get('/sadmin', haveToken, checkRole('superAdmin'), async function (req, res) {
    let users = await UserModel.find()
    res.send(users)
});

//  admin adding 
userRoute.post('/sadmin/create', haveToken, checkRole("superAdmin"), async function (req, res) {
    const { name, email, role, password } = req.body;
    bcrypt.hash(password, 5, async (err, hash) => {
        user = UserModel({ name, email, password: hash, role })
        await user.save()
        return res.send({ "messege": "Super Admin registered one user" })
    })
});

//  admin delete 
userRoute.delete('/sadmin/delete/:userID', haveToken, checkRole("superAdmin"), async function (req, res) {
    await UserModel.findByIdAndDelete({ _id: req.params.userID })
    return res.status(200).send({ "messege": "Super Admin deleted one user" })
});
//  all details of SUPER ADMIN----------------->> 


//  ------------ ADMIN--------------------
userRoute.get('/admin', haveToken, checkRole('admin'), async function (req, res) {
    let users = await UserModel.find()
    res.send(users)
});

//  admin adding 
userRoute.post('/admin/create', haveToken, checkRole("admin"), async function (req, res) {
    const { name, email, role, password } = req.body;
    bcrypt.hash(password, 5, async (err, hash) => {
        user = UserModel({ name, email, password: hash, role })
        await user.save()
        return res.send({ "messege": "Admin registered one user" })
    })
});

//  admin delete 
userRoute.delete('/admin/delete/:userID', haveToken, checkRole("admin"), async function (req, res) {
    await UserModel.findByIdAndDelete({ _id: req.params.userID })
    return res.status(200).send({ "messege": "Admin deleted one user" })
});


module.exports = { userRoute }