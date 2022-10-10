const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const bookModel = require('../models/bookModel')

const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
    
        if (!token) return res.status(401).send({ status: false, message: "Token is Not Present" })

        let decodedToken;
        try {
                 decodedToken = jwt.verify(token, "projectgroup25-importent-key")
        }
        catch (err) {
            return res.status(401).send({ status: false, message:"Token is inValid" })
        }
        req['x-api-key'] = decodedToken
        
        next()
    }
    catch (err) {
        return res.status(500).send({ msg: "Error", error: err.message })
    }

}
const Authorisation = async function (req, res, next) {
    try {
        let bookId = req.params.bookId
        if(!bookId) return res.status(400).send({ status: false, message: "BookId is Mandatory on req Params" })

        if (!mongoose.Types.ObjectId.isValid(bookId)) 
            return res.status(400).send({ status: false, message: "BookId is inValid" })

        let bookData = await bookModel.findById(bookId)

        if (!bookData) return res.status(404).send({ status: false, message: "BookId does not exist" })

        if(req['x-api-key'].userId != bookData.userId) return res.status(403).send({ status: false, message: "authorisation failed" })
        next()

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports ={authentication , Authorisation  }
