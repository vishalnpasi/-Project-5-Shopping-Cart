const bcrypt = require('bcrypt')
const validation = require('../validation/validation')
const aws = require('../aws/aws')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const userModel = require('../models/userModel')

const createUser = async function (req, res) {
    try {
        let requestBody = req.body

        if (!validation.isValidRequestBody(requestBody)) return res.status(400).send({ status: false, message: 'user data is required in body' })

        let { fname, lname, email, phone, password, address } = requestBody

        if (!validation.isValid(fname)) return res.status(400).send({ status: false, message: "fname is Mandatory" })
        if (!validation.isValidString(fname)) return res.status(400).send({ status: false, message: 'Invalid Fname, available characters ( A-Z, a-z )' })

        if (!validation.isValid(lname)) return res.status(400).send({ status: false, message: "lname is Mandatory" })
        if (!validation.isValidString(lname)) return res.status(400).send({ status: false, message: 'Invalid lname, available characters ( A-Z, a-z )' })


        if (!validation.isValid(email)) return res.status(400).send({ status: false, message: "email is Mandatory" })
        if (!validation.emailValidation(email)) return res.status(400).send({ status: false, message: 'please enter a valid email' })

        const emailExist = await userModel.findOne({ email: email })
        if (emailExist) return res.status(400).send({ status: false, message: "Email Already Exist" })

        if (!validation.isValid(phone)) return res.status(400).send({ status: false, message: "phone number is Mandatory" })
        if (!validation.mobileValidation(phone)) return res.status(400).send({ status: false, message: 'please enter a valid phone number' })

        const phoneNumberExist = await userModel.findOne({ phone: phone })
        if (phoneNumberExist) return res.status(400).send({ status: false, message: "phone Number  Already Exist" })

        if (!validation.isValid(password)) return res.status(400).send({ status: false, message: "password is Mandatory" })
        if (!validation.isValidPassword(password)) return res.status(400).send({ status: false, message: 'please enter a valid password' })

        if (!address) return res.status(400).send({ status: false, message: "address is Mandatory" })

        if (typeof (address) !== 'object') {
            try {
                address = JSON.parse(address)
            }
            catch (err) {
                return res.status(400).send({ status: false, message: "address type must be Object" })
            }
        }
        if (typeof (address) !== 'object') return res.status(400).send({ status: false, message: "address type must be Object" })

        if (!address.shipping) return res.status(400).send({ status: false, message: "Address shipping is Mandatory" })
        if (!address.shipping.street) return res.status(400).send({ status: false, message: "Address shipping street is Mandatory" })
        if (!address.shipping.city) return res.status(400).send({ status: false, message: "Address shipping city is Mandatory" })
        if (!address.shipping.pincode) return res.status(400).send({ status: false, message: "Address shipping pincode is Mandatory" })
        if (!validation.isvalidPincode(address.shipping.pincode)) return res.status(400).send({ status: false, message: 'address shipping pincode is mandatory of 6 digit' })

        if (!address.billing) return res.status(400).send({ status: false, message: "Address billing is Mandatory" })
        if (!address.billing.street) return res.status(400).send({ status: false, message: "Address billing street is Mandatory" })
        if (!address.billing.city) return res.status(400).send({ status: false, message: "Address billing city is Mandatory" })
        if (!address.billing.pincode) return res.status(400).send({ status: false, message: "Address billing pincode is Mandatory" })
        if (!validation.isvalidPincode(address.billing.pincode)) return res.status(400).send({ status: false, message: 'address billing pincode is mandatory of 6 digit' })
        requestBody.address = address

        let files = req.files
        if (files.length == 0) return res.status(400).send({ status: false, message: 'Image File is Mandatory' })

        let uploadedFileURL = await aws.uploadFile(files[0])

        requestBody.profileImage = uploadedFileURL

        const encryptedPassword = await bcrypt.hash(password, 10);
        requestBody.password = encryptedPassword

        let userData = await userModel.create(requestBody)
        return res.status(201).send({ status: true, message: "User created successfully", data: userData })
    }
    catch (err) {
        return res.status(500).send({ status: false, error: err.message })
    }

}
const loginUser = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password

        if (!email) return res.status(400).send({ status: false, message: "Email is Mandatory" })

        if (!password) return res.status(400).send({ status: false, message: "Password is Mandatory" })

        let userData = await userModel.findOne({ email: email })

        if (!userData) return res.status(400).send({ status: false, message: "User Data Not Found" })

        const result = await bcrypt.compare(password, userData.password)

        if (!result) return res.status(400).send({ status: false, message: "Invalid Password" })

        let payload = { userId: userData._id.toString() }
        let token = jwt.sign(payload, "project5group11-secrate-key", { expiresIn: "24h" });

        return res.status(200).send({ status: true, message: "User login successfull", data: { userId: userData._id, token: token } })

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}

const getUser = async function (req, res) {
    try {
        let userId = req.params.userId

        let userData = await userModel.findById(userId)
        if (!userData) return res.status(404).send({ status: false, message: "User Data Not Found" })

        return res.status(200).send({ status: true, message: "User profile details", data: userData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}
const updateUser = async function (req, res) {
    try {
        const requestBody = req.body
        let userId = req.params.userId
        if (!validation.isValidRequestBody(requestBody) && !req.files)
            return res.status(400).send({ status: false, message: "PLS provide some data to update" })

        let { fname, lname, email, profileImage, phone, password, address } = requestBody

        if (fname) {
            if (!validation.isValid(fname)) return res.status(400).send({ status: false, message: "fname is Mandatory" })
            if (!validation.isValidString(fname)) return res.status(400).send({ status: false, message: 'Invalid Fname, available characters ( A-Z, a-z )' })
        }
        if (lname) {
            if (!validation.isValid(lname)) return res.status(400).send({ status: false, message: "lname is Mandatory" })
            if (!validation.isValidString(lname)) return res.status(400).send({ status: false, message: 'Invalid lname, available characters ( A-Z, a-z )' })
        }
        if (email) {
            if (!validation.isValid(email)) return res.status(400).send({ status: false, message: "email is Mandatory" })
            if (!validation.emailValidation(email)) return res.status(400).send({ status: false, message: 'please enter a valid email' })
            const emailExist = await userModel.findOne({ email: email })
            if (emailExist) return res.status(400).send({ status: false, message: "Email Already Exist" })
        }
        if (phone) {
            if (!validation.isValid(phone)) return res.status(400).send({ status: false, message: "phone number is Mandatory" })
            if (!validation.mobileValidation(phone)) return res.status(400).send({ status: false, message: 'please enter a valid phone number' })
            const phoneNumberExist = await userModel.findOne({ phone: phone })
            if (phoneNumberExist) return res.status(400).send({ status: false, message: "phone Number  Already Exist" })
        }
        if (password) {
            if (!validation.isValid(password)) return res.status(400).send({ status: false, message: "password is Mandatory" })
            if (!validation.isValidPassword(password)) return res.status(400).send({ status: false, message: 'please enter a valid password' })
            requestBody.password = await bcrypt.hash(password,10)
        }
        if (address) {
            if (typeof (address) !== 'object') {
                try {
                    address = JSON.parse(address)
                }
                catch (err) {
                    return res.status(400).send({ status: false,mgs:err.message, message: "address type must be Object catec" })
                }
            }
            if (typeof (address) !== 'object') return res.status(400).send({ status: false, message: "address type must be Object" })

            let userData = await userModel.findById(userId)
            let oldAddress = userData.address
            if (address.shipping) {
                const {street,city,pincode}=address.shipping
                if(street) oldAddress.shipping.street = street
                if(city) oldAddress.shipping.city = city

                if (pincode) {
                    if (!validation.isvalidPincode(pincode)) return res.status(400).send({ status: false, message: 'address shipping pincode is mandatory of 6 digit' })
                    oldAddress.shipping.pincode = pincode
                }
                
            }
            if (address.billing) {
                const {street,city,pincode}=address.billing

                if(street) oldAddress.billing.street = street
                if(city) oldAddress.billing.city = city
                if (pincode) {
                    if (!validation.isvalidPincode(pincode)) return res.status(400).send({ status: false, message: 'address billing pincode is mandatory of 6 digit' })
                    oldAddress.billing.pincode = pincode
                }
                
            }
            requestBody.address = oldAddress
        } 
        if(req.files.length>0)
                requestBody.profileImage = await aws.uploadFile(req.files[0])
        let updatedData = await userModel.findByIdAndUpdate({_id:userId},{$set:requestBody},{new:true})

        if(!updatedData) return res.status(404).send({ status: false, message: 'User Data Not Found' })

        return res.status(200).send({ status: true, message: "User Updated Successfully", data: updatedData })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { createUser, loginUser, getUser, updateUser }
