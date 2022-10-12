const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const Authentication = async function (req, res, next) {
    try {
        let token = req.headers["authorization"]

        if (!token) return res.status(401).send({ status: false, message: "Token is Not Present" })
        token = token.split(" ")
        token = token[1]

        jwt.verify(token, "project5group11-secrate-key", function (err, decodedToken) {
            if (err)
                return res.status(401).send({ status: false, message: "Token is inValid" })
            req["authorization"] = decodedToken
            next()
        })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}
const Authorisation = async function (req, res, next) {
    try {
        let userId = req.params.userId
        if (!userId) return res.status(400).send({ status: false, message: "UserId is Mandatory on req Params" })

        if (!mongoose.Types.ObjectId.isValid(userId))
            return res.status(400).send({ status: false, message: "UserId is inValid" })

        if ( req["authorization"].userId != userId) return res.status(403).send({ status: false, message: "Authorisation failed" })
        next()

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { Authentication, Authorisation }
