const cartModel = require('../models/cartModel')
const productModel = require('../models/productModel')
const validation = require('../validation/validation')

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!validation.isValidRequestBody(req.body))
            return res.status(400).send({ status: false, message: "PLS provide some Data on req body" })
        const { cartId, productId } = req.body

        if (!productId) return res.status(400).send({ status: false, message: "ProducatId is Mandatory" })

        if (!validation.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "ProductId is Invalid" })

        let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDetails)
            return res.status(400).send({ status: false, message: "Product Doesn't Exist" })

        let cartData = {}
        let savedCart;
        if (cartId) {
            if (!validation.isValidObjectId(cartId))
                return res.status(400).send({ status: false, message: "CartId is Invalid" })

            let findCart = await cartModel.findOne({ _id: cartId, userId: userId })
            if (!findCart) return res.status(400).send({ status: false, message: "Cart doesn't Exist by given CartId" })

            let chk = 0;
            for (let i = 0; i < findCart.items.length; i++) {
                if (findCart.items[i].productId === productId) {
                    findCart.items[i].quantity++;
                    cartData.items = findCart.items
                    cartData.totalPrice = findCart.totalPrice + productDetails.price
                    chk++
                    break
                }
            }
            if (chk == 0) {
                cartData.totalItems = findCart.items.push({ productId: productId, quantity: 1 })
                cartData.items = findCart.items
                // cartData.totalItems = findCart.items.length;
                cartData.totalPrice = findCart.totalPrice + productDetails.price
            }
            savedCart = await cartModel.findOneAndUpdate({ _id: cartId }, cartData, { new: true })
            return res.status(201).send({ status: true, message: "Success", data: savedCart })
        }
        let findCart = await cartModel.findOne({ userId: userId })
        if (findCart) return res.status(400).send({ status: false, message: "Cart Already Created..." })
        cartData.userId = userId
        cartData.items = { productId: productId, quantity: 1 }
        cartData.totalPrice = productDetails.price
        cartData.totalItems = 1
        savedCart = await cartModel.create(cartData)

        return res.status(201).send({ status: true, message: "Success", data: savedCart })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updateCart = async function (req, res) {

}

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
            // return res.status(400).send({ status: false, message: "Product Doesn't Exist" })

        let savedCart = await cartModel.find().populate()
        return res.status(201).send({ status: true, message: "Success", data: savedCart })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteCart = async function (req, res) {

}

module.exports = { createCart, updateCart, getCart, deleteCart }