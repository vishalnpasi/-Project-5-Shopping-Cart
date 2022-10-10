//*****Validation******* */

const mongoose = require('mongoose')

const isValid = function (value) {
    if (typeof (value) === 'undefined' || value === null) return false
    if (typeof (value) === 'string' && value.trim().length == 0) return false
    return true
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
    let regexforpassword = /^(?=.*\d)(?=.*[a-z]).{8,15}$/
    return regexforpassword.test(password)
}
const isValidEnum = function (value) {
    if (["Mr", "Mrs", "Miss"].find(element => element === value)) return true;
    return false;
}
const TIME = function (releasedAt) {
    let regexFortime = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
    return regexFortime.test(releasedAt)

}
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

const isvalidNumber = function (value) {
    if (typeof (value) === 'undefined' || value === null) return false
    if (typeof (value) === 'string' && value.trim().length === 0) return false
    if (typeof (value) === 'number') return true

}
module.exports = { isValid, isValidRequestBody, emailValidation, mobileValidation, isValidPassword, isValidEnum , isValidObjectId, isvalidNumber ,TIME}