const validation = require('../validation/validation')
const aws = require('../aws/aws')
const productModel = require('../models/productModel')
const moment = require('moment')
// const { update } = require('../models/productModel')

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

        if (currencyId) {
            if (currencyId !== "INR" && currencyId !== 'USD') return res.status(400).send({ status: false, message: "CurrencyId Should be in INR " })
        }
        if (currencyFormat) {
            if (currencyFormat !== "₹") return res.status(400).send({ status: false, message: "CurrencyFormat Should be in.. ₹ " }) // CTRL + ALT + 4($)..
        }
        if (isFreeShipping) {
            if (isFreeShipping !== 'true' && isFreeShipping !== 'false')
                return res.status(400).send({ status: false, message: "isFreeShipping type Should be Boolean" })
        }
        if (style) {
            if (!validation.isValid(style))
                return res.status(400).send({ status: false, message: "style type is should be in String" })
        }
        if (availableSizes) {   // accept format , XS , "XS" , ["XS","L"]
            let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if (enumArr.find(value => value === availableSizes))    // XS
                requestBody.availableSizes = [availableSizes]
            else {
                try { //for invalid enumValue
                    availableSizes = JSON.parse(availableSizes) //parsing "XS" , ["X","L"]
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
    try {
        let findData = {}
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query

        if (size) findData.availableSizes = size;
        if (name) findData.title = { $regex: name }
        if (priceLessThan) {
            priceLessThan = Number(priceLessThan)
            if (isNaN(priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan type Should be Number" })
            findData.price = { $lt: priceLessThan }
        }
        if (priceGreaterThan) {
            priceGreaterThan = Number(priceGreaterThan)
            if (isNaN(priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan type Should be Number" })
            findData.price = { $gt: priceGreaterThan }
        }
        if (priceLessThan && priceGreaterThan)
            findData.price = { $lt: priceLessThan, $gt: priceGreaterThan }

        findData.isDeleted = false
        let productDetails = await productModel.find(findData)

        if(productDetails.length===0)
            return res.status(404).send({ status: false, message: "Data Not Found by given filter"})
        if (priceSort) {
            if (priceSort !== '1' && priceSort !== '-1')
                return res.status(400).send({ status: false, message: "priceSort type Should be Number like 1 for ascending , -1 for Descending" })
            if (priceSort === '1')
                productDetails.sort((a, b) => { return a.price - b.price })
            if (priceSort === '-1')
                productDetails.sort((a, b) => { return b.price - a.price })
        }
        return res.status(200).send({ status: true, message: "Success", data: productDetails })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!productId) return res.status(400).send({ status: false, message: "PLS enter ProductId on Params" })

        if (!validation.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "ProductId is Invalid" })

        let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!productDetails) return res.status(404).send({ status: false, message: "Product Data Not Found" })

        return res.status(200).send({ status: true, message: "Success", data: productDetails })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if(!productId) return res.status(404).send({ status: false, message: "ProductId not found , pls give ProductId on params" })
        if(!validation.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "ProductId is Invalid" })

        let checkProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProduct) return res.status(400).send({ status: false, message: " Product Data not found" })

        if (!validation.isValidRequestBody(req.body) && !req.files) return res.status(400).send({ status: false, message: "PLS provide some data to update" })

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, isDeleted, deletedAt } = req.body

        let updateData = {}
        if (title) {
            if (!validation.isValid(title)) return res.status(400).send({ status: false, message: " title name is Invalid" })
            let titlePresent = await productModel.findOne({title:title})
            if(titlePresent) return res.status(400).send({ status: false, message: " title already present in DB" })
            updateData.title = title
        }
        if (description) {
            if (!validation.isValid(description)) return res.status(400).send({ status: false, message: " description name is Invalid" })
            updateData.description = description
        }
        if (price) {
            price = Number(price)
            if (isNaN(price)) return res.status(400).send({ status: false, message: "Price Should be in Number" })
            updateData.price = price
        }
        if (currencyId) {
            if (currencyId !== 'INR' && currencyId !== 'USD') return res.status(400).send({ status: false, message: "currencyId should be  INR " })
            updateData.currencyId = currencyId
        }
        if (currencyFormat) {
            if (currencyFormat !== "₹") return res.status(400).send({ status: false, message: "currencyFormat should be .... ₹ " })
            updateData.currencyFormat = currencyFormat
        }
        if (isFreeShipping) {
            if (isFreeShipping !== 'true' && isFreeShipping !== 'false') return res.status(400).send({ status: false, message: "isFreeShipping type should be in boolean " })
            updateData.isFreeShipping = isFreeShipping
        }
        if (style) {
            if (!validation.isValid(style)) return res.status(400).send({ status: false, message: "style is Invalid" })
            updateData.style = style
        }
        if (installments) {
            installments = Number(installments)
            if (isNaN(installments)) return res.status(400).send({ status: false, message: "installments type Should be Number" })
            updateData.installments = installments
        }
        if (isDeleted) {
            if (isDeleted !== 'true' && isDeleted !== 'false')
                return res.status(400).send({ status: false, message: "isDeleted should be Boolean" })
            if (isDeleted === 'true') {
                updateData.isDeleted = true
                if (deletedAt){
                    if(!moment(deletedAt,"YYYY-MM-DD",true).isValid())
                        return res.status(400).send({ status: false, message: "DeletedAt format should be YYYY-MM-DD" })
                    updateData.deletedAt = deletedAt
                }
                else updateData.deletedAt = Date.now()
            }
            else if(isDeleted ==='false')
                updateData.isDeleted = false
        }
        if (req.files.length > 0) {
            let files = req.files
            updateData.productImage = await aws.uploadFile(files[0])
        }
       
        updateData = { $set: updateData } // { $set: { title:'axi' , decription:"as"} , $pull/$addToSet}
        if (availableSizes) {
            if (checkProduct.availableSizes.find(value => value === availableSizes)) {
                updateData.$pull = {availableSizes : availableSizes }
            }
            else 
            {
                let enumArr = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                if (!enumArr.find(value => value === availableSizes))
                    return res.status(400).send({ status: false, message: "Available size is Invalid " })
                updateData.$addToSet = { availableSizes : availableSizes}
            }
        }
        let updateProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, updateData , { new: true })
        if (!updateProduct) return res.status(404).send({ status: false, message: "product not found" })

        return res.status(200).send({ status: true, message: "Success", data: updateProduct })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId

        if(!validation.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "ProductId is Invalid" })
        
        let checkProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false },{$set :{isDeleted:true , deletedAt:Date.now()}})
        if (!checkProduct) return res.status(404).send({ status: false, message: " Product Data not found" })

        return res.status(200).send({ status: true, message: "Success"})

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createProduct, getAllProduct, getProductById, updateProduct, deleteProduct }