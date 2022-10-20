const orderModel = require('../models/orderModel')
const cartModel = require('../models/cartModel')
const validation = require('../validation/validation')

const createOrder = async function(req,res){
    try {
        let userId = req.params.userId

        if(!validation.isValidRequestBody(req.body))
            return res.status(400).send({ status: false, message: "PLS provide some data to update" })
        let {cartId ,cancellable , status} = req.body
        if(!cartId) return res.status(400).send({ status: false, message: "CartId is Mandatory" })

        let cartDetails = await cartModel.findOne({ _id: cartId , userId:userId})

        if (!cartDetails)  return res.status(400).send({ status: false,message: "cartId does not exists of given userId" })

        if(cartDetails.items.length ===0)
            return res.status(400).send({ status: false,message: "In Cart No items for Order" })

        let createOrder = {}
        createOrder.userId = userId;
        createOrder.items = cartDetails.items
        createOrder.totalPrice = cartDetails.totalPrice;
        createOrder.totalItems = cartDetails.totalItems
        let totalQuantity = 0;
        for(let i = 0; i<cartDetails.items.length;i++)
            totalQuantity+= cartDetails.items[i].quantity
        createOrder.totalQuantity = totalQuantity

        if(cancellable){
            if(cancellable!=='true' && cancellable!=='false')
                return res.status(400).send({ status: false,message: "cancellable type should be Boolean" }) 
            createOrder.cancellable = cancellable   
        }
        //..........Removing Cart items..............
        await cartModel.findOneAndUpdate({ _id: cartId },{$set:{items:[],totalPrice:0,totalItems:0}})


        let savedOrder = await(await orderModel.create(createOrder))
                            .populate('items.productId',{title:1,price:1,productImage:1})

        delete savedOrder._doc.isDeleted
        delete savedOrder._doc.__v

        return res.status(201).send({ status: true, message: "Success", data: savedOrder })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
const updateOrder = async function(req,res){
    try {
        let userId = req.params.userId

        if(!validation.isValidRequestBody(req.body))
            return res.status(400).send({ status: false, message: "PLS provide some data to update" })

        let {orderId , status} = req.body

        if(!orderId) return res.status(400).send({ status: false, message: "OrderId is Mandatory" })
        if(!validation.isValidObjectId(orderId))
            return res.status(400).send({ status: false, message: "OrderId is Invalid" })

        if(!status) return res.status(400).send({ status: false, message: "Status is Mandatory" })
        if(!["pending", "completed", "canceled"].includes(status))
            return res.status(400).send({ status: false, message: "Status Should be one in ... pending, completed , canceled" })

        let orderDetails = await orderModel.findOne({ _id: orderId , userId:userId})

        if (!orderDetails)  return res.status(400).send({ status: false,message: "OrderId does not exists of given userId" })

        if(orderDetails.status === status)
            return res.status(400).send({ status: false,message: "Order Already "+status })

        if(orderDetails.status !== 'pending')
            return res.status(400).send({ status: false,message: `Order can't be ${status}...because that have ${orderDetails.status}` })

        let updateData ={status:status}
        if(status === 'canceled'){
            if(!orderDetails.cancellable)
                return res.status(400).send({ status: false,message: "Can't Cancel the Order.. this order are not Cancelable" })
            updateData.isDeleted = true
            updateData.deletedAt = Date.now()
        }
        let updatedOrder = await orderModel.findOneAndUpdate({_id:orderId},{$set:updateData},{new:true})
                                            .populate('items.productId',{title:1,price:1,productImage:1})
        delete updatedOrder._doc.isDeleted
        delete updatedOrder._doc.deletedAt
        delete updatedOrder._doc.__v

        return res.status(200).send({ status: true, message: "Success", data: updatedOrder })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}
module.exports = { createOrder , updateOrder }
