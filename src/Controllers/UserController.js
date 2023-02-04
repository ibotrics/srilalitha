const { UserDetails } = require('../utilities/dbUtilitiess.js');
const { sign, verify } = require('jsonwebtoken');
// const emailService = require('../services/EmailService');
const bcrypt = require('bcrypt');
const { HTTP_STATUS_CREATED, HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_ACCEPTED } = require('http2').constants;
const catchAsync = require('../utilities/CatchAsync.js');
const moment = require('moment')


const createToken = (user) => {
    const expiresIn = 60 * 60
    const dataStoredInToken = {
        userId: user.userId,
        name: user.name,
        email: user.email,
    }
    return sign(dataStoredInToken, process.env.JWT_SECRET, { expiresIn })
}

// Register
exports.save = catchAsync(async (req, res, next) => {
    try {
        const { userId, firstName, lastName, email, mobile, locationId, sublocationId, departmentId, roleId, password } = req.body
        if (userId && userId != '' && userId != 0) {
            const user = await UserDetails.findOne({ where: { userId: userId } });
            if (user) {
                const responseBody = { firstName, lastName, email, mobile, locationId, sublocationId, departmentId, status, roleId }
                await UserDetails.update(responseBody, { where: { userId: userId } })
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: true,
                    message: "User updated successfully"
                })
            } else {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "User not found to update"
                })
            }
        } else {
            const user = await UserDetails.findOne({ where: { email: email } });
            if (user) {
                res.status(HTTP_STATUS_ACCEPTED).json({
                    status: false,
                    message: "User already exist"
                })
            } else {
                const hasPassword = bcrypt.hashSync(password, 10);
                const responseBody = {
                    firstName, lastName, email, mobile, locationId, sublocationId, departmentId, roleId, password: hasPassword
                }
                await UserDetails.create(responseBody);
                res.status(HTTP_STATUS_CREATED).json({
                    status: true,
                    message: "User created successfully"
                })
            }
        }
    }
    catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})


// Get all user details
exports.getAll = catchAsync(async (req, res) => {
    try {
        let user = await UserDetails.findAll();
        if (user) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "User data found",
                data: user
            })
        } else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "No data found",
                data: []
            })
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})


// // Get By _id
exports.getById = catchAsync(async (req, res) => {
    try {
        let user = await UserDetails.findOne({ where: { userId: req.params.userId } });
        if (user) {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "User found",
                data: user.dataValues
            })
        }
        else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "User not found",
                data: {}
            })
        }
    } catch (err) {
        return res.status(500).send({ sucess: false, message: err.message })
    }
})



// // Login
exports.login = catchAsync(async (req, res) => {
    let user = await UserDetails.findOne({ where: { email: req.body.email } });
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const tokenData = createToken(user)
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: true,
                message: "Login success",
                token: tokenData,
                user: user.dataValues
            })
        } else {
            res.status(HTTP_STATUS_ACCEPTED).json({
                status: false,
                message: "Incorrect password"
            })
        }
    } else {
        res.status(HTTP_STATUS_ACCEPTED).json({
            status: false,
            message: "Email not found"
        })
    }
})