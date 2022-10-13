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

        if (currencyId) {
            if (currencyId !== "INR" && currencyId !== 'USD') return res.status(400).send({ status: false, message: "CurrencyId Should be in INR " })
        }
        if (currencyFormat) {
            if (currencyFormat !== "₹") return res.status(400).send({ status: false, message: "CurrencyFormat Should be in.. ₹ " }) // CTRL + ALT + 4($)..
        }
        if (isFreeShipping) {
            if (isFreeShipping !== 'true' && isFreeShipping !=='false')
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
    try{
        let findData = {}
        let {size , name , priceGreaterThan , priceLessThan ,priceSort} = req.query
        
        if(size) findData.availableSizes = size;
        if(name) findData.title = {$regex:name}
        if(priceLessThan){
            priceLessThan = Number(priceLessThan)
            if (isNaN(priceLessThan)) return res.status(400).send({ status: false, message: "priceLessThan type Should be Number" })
            findData.price = { $lt:priceLessThan }
        }
        if(priceGreaterThan){
            priceGreaterThan = Number(priceGreaterThan)
            if (isNaN(priceGreaterThan)) return res.status(400).send({ status: false, message: "priceGreaterThan type Should be Number" })
            findData.price = {$gt:priceGreaterThan}
        }
        if(priceLessThan && priceGreaterThan) 
            findData.price = { $lt:priceLessThan , $gt:priceGreaterThan }

        findData.isDeleted = false
        let productDetails = await productModel.find(findData)  // 1st option to find 2nd option to updata(structur also)
        // let productDetails = await productModel.aggregate([
        //     {
        //         $match:findData    // we can give multiple object to find doc
        //     },
        //     {
        //         $match:findData
        //     }
        // ])
        if(priceSort){
            if(priceSort !=='1' && priceSort!=='-1') 
                return res.status(400).send({ status: false, message: "priceSort type Should be Number like 1 for ascending , -1 for Descending" })    
            if(priceSort === '1')
                productDetails.sort((a,b) =>{return a.price - b.price})
            if(priceSort === '-1')
                productDetails.sort((a,b) =>{return b.price - a.price})
        }
        return res.status(200).send({ status: true, message: "Success", data:productDetails })

    }catch (err) {
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

        return res.status(200).send({ status: true, message: "Success", data:productDetails })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateProduct = async function (req, res) {

}

const deleteProduct = async function (req, res) {

}

module.exports = { createProduct, getAllProduct, getProductById, updateProduct, deleteProduct }