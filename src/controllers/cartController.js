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
            savedCart = await cartModel.findOneAndUpdate({ _id: cartId },{$set:cartData}, { new: true })
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
    try {
        let userId = req.params.userId
        let requestBody = req.body
        if (!validation.isValidRequestBody(req.body))
            return res.status(400).send({ status: false, message: "PLS provide some Data on req body" })
   
        const { cartId, productId, removeProduct } = requestBody

        if(!validation.isValidObjectId(cartId))return res.status(400).send({ status: false,message: "cartId is Invalid" })

        if(!validation.isValidObjectId(productId))return res.status(400).send({ status: false,message: "productId is Invalid" })
        
        if(removeProduct!==0 && removeProduct !== 1)
            return res.status(400).send({ status: false,message: "removeProduct should be 0 or 1" })
        
        let cart = await cartModel.findOne({ _id: cartId , userId:userId})

        if (!cart)  return res.status(400).send({ status: false,message: "cartId does not exists" })

        if(cart.items.length == 0)return res.status(400).send({ status: false,message: "there is no Product to update" })
        
        let product = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!product) return res.status(400).send({ status: false, message: "productId does not exists" })

        let updateData = {}
        if (removeProduct === 0) {

            for(let i = 0;i<cart.items.length;i++){
                if(cart.items[i].productId === productId){
                    updateData.totalPrice = cart.totalPrice -(product.price*cart.items[i].quantity)
                    cart.items.splice(i,1)
                    updateData.items = cart.items
                    updateData.totalItems = --cart.totalItems;
                }
            }
        }
        else{
            for(let i = 0;i<cart.items.length;i++){
                if(cart.items[i].productId === productId){
                    cart.items[i].quantity--;
                    updateData.items = cart.items
                    if(cart.items[i].quantity ===0){
                        cart.items.splice(i,1);
                        updateData.items = cart.items
                        updateData.totalItems = --cart.totalItems;
                    }
                    updateData.totalPrice = cart.totalPrice - product.price
                }
        }}
        let updatedCart = await cartModel.findOneAndUpdate({ _id: cartId },{$set:updateData}, { new: true })
        return res.status(200).send({ status: true, message: "product has been removed", data: updatedCart })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let savedCart = await cartModel.findOne({ userId: userId })

        if (!savedCart) return res.status(400).send({ status: false, message: "Cart doesn't Exist" })

        return res.status(200).send({ status: true, message: "Success", data: savedCart })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const deleteCart = async function (req, res) {
    try {
        let userId = req.params.userId
        let savedCart = await cartModel.findOne({ userId: userId })

        if (!savedCart) return res.status(400).send({ status: false, message: "Cart doesn't Exist" })
        if(savedCart.items.length == 0)
            return res.status(400).send({ status: false, message: "Cart doesn't Exist" })
        savedCart = await cartModel.findOneAndUpdate({userId:userId},{$set:{items:[]},totalPrice:0,totalItems:0},{new:true})

        return res.status(204).send({ status: true, message: "Success"})

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createCart, updateCart, getCart, deleteCart }