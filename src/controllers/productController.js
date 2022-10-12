const validation = require('../validation/validation')
const aws = require('../aws/aws')
const productModel = require('../models/productModel')

const createProduct = async function (req, res) {
    try {
        let requestBody = req.body
        if (!validation.isValidRequestBody(requestBody))
            return res.status(400).send({ status: false, message: "PLS provide some data to update" })
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = requestBody

        if (!validation.isValid(title)) return res.status(400).send({ status: false, message: "Title is Mandatory" })
        let uniqueTitle = await productModel.findOne({ title: title })
        if (uniqueTitle) return res.status(400).send({ status: false, message: "Title is Already Present" })

        if (!validation.isValid(description)) return res.status(400).send({ status: false, message: "Description is Mandatory" })

        if (!price) return res.status(400).send({ status: false, message: "Price is Mandatory" })
        price = Number(price)
        if (isNaN(price)) return res.status(400).send({ status: false, message: "Price Should be in Number" })

        if (currencyId) {//return res.status(400).send({ status: false, message: "CurrencyId is Mandatory" })
            if (currencyId !== "INR" && currencyId !== 'USD') return res.status(400).send({ status: false, message: "CurrencyId Should be in INR " })
        }
        if (currencyFormat) {// return res.status(400).send({ status: false, message: "CurrencyFormat is Mandatory" })
            if (currencyFormat !== "₹") return res.status(400).send({ status: false, message: "CurrencyFormat Should be in.. ₹ " }) // CTRL + ALT + 4($)..
        }
        if (isFreeShipping) {
            if (typeof isFreeShipping !== 'boolean')
                return res.status(400).send({ status: false, message: "isFreeShipping type Should be Boolean" })
        }
        if (style) {
            if (!validation.isValid(style))
                return res.status(400).send({ status: false, message: "style type is should be in String" })
        }
        if (availableSizes) {

            let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if (enumArr.find(value => value === availableSizes))
                requestBody.availableSizes = [availableSizes]
            else {      
                try {
                    availableSizes = JSON.parse(availableSizes) // XS , "XS"
                } catch (err) {
                    return res.status(400).send({ status: false, message: "Available size is Invalid" })
                }
                if (typeof (availableSizes) === 'object') {
                    let uniqueSizes = [...new Set(availableSizes)]
                    for (let i = 0; i < uniqueSizes.length; i++) {
                        if (!enumArr.find(value => value === uniqueSizes[i]))
                            return res.status(400).send({ status: false, message: "Available size is Invalid" })
                    }
                    requestBody.availableSizes = uniqueSizes
                }
                else {
                    if (!enumArr.find(value => value === availableSizes))
                        return res.status(400).send({ status: false, message: "Available size is Invalid" })
                    requestBody.availableSizes = [availableSizes]
                }
            }
        }
        if (installments) {
            installments = Number(installments)
            if (isNaN(installments)) return res.status(400).send({ status: false, message: "installments type Should be Number" })
        }
        let files = req.files
        if (files.length == 0) return res.status(400).send({ status: false, message: 'ProductImage File is Mandatory' })

        let uploadedFileURL = await aws.uploadFile(files[0])
        requestBody.productImage = uploadedFileURL

        let savedProduct = await productModel.create(requestBody)
        return res.status(201).send({ status: true, message: "Success", data: savedProduct })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getAllProduct = async function (req, res) {
    // try{
    //     let {size , name , priceGreaterThan , priceLessThan } = req.

    // }catch (err) {
    //     return res.status(500).send({ status: false, message: err.message })
    // }
}

const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!productId) return res.status(400).send({ status: false, message: "PLS enter ProductId on Params" })

        if (!validation.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "ProductId is Invalid" })

        let userData = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!userData) return res.status(404).send({ status: false, message: "Product Data Not Found" })

        return res.status(200).send({ status: true, message: "Success", data: userData })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateProduct = async function (req, res) {

}

const deleteProduct = async function (req, res) {

}

module.exports = { createProduct, getAllProduct, getProductById, updateProduct, deleteProduct }