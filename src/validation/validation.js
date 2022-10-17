//*****Validation******* */

const mongoose = require('mongoose')

const isValid = function (value) {
    if (typeof (value) !== "string" || typeof (value) === 'undefined' || value === null) return false
    if (typeof (value) === 'string' && value.trim().length == 0) return false
    return true
}
const isValidString = function (value) {
    let regex = /^[a-zA-Z]+([\s][a-zA-Z]+)*$/
    return regex.test(value)
}
const isValidRequestBody = function (reqBody) {
    return Object.keys(reqBody).length > 0
}

const emailValidation = function (email) {
    let regexForEmail =/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/ //  /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{1,3})+$/
    return regexForEmail.test(email)
}

const mobileValidation = function (phone) {
    let regexForMobile = /^[6-9]\d{9}$/
    return regexForMobile.test(phone)
}

const isValidPassword = function (password) {
    let regexforpassword = /^(?=.*[a-z]).{8,15}$/
    return regexforpassword.test(password)
}
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}
const isvalidPincode = function (pincode) {
    return /^\d{6}$/.test(pincode)
}
module.exports = { isValid,isValidString, isValidRequestBody, emailValidation, mobileValidation, isValidPassword, isValidObjectId , isvalidPincode}