const express = require('express')
const router = express.Router();

const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const mid = require('../middleware/mid')


//.......................................... User APIs.............................................................

router.post('/register',userController.createUser)

router.post('/login',userController.loginUser)

router.get('/user/:userId/profile',mid.Authentication , mid.Authorisation , userController.getUser)

router.put('/user/:userId/profile',mid.Authentication , mid.Authorisation , userController.updateUser)

// .........................................Product APIs.....................................................................

router.post('/products',productController.createProduct)

router.get('/products',productController.getAllProduct)

router.get('/products/:productId',productController.getProductById)

router.put('/products/:productId',productController.updateProduct)

router.delete('/products/:productId',productController.deleteProduct)

//..........................................Cart APIs...........................................

router.post('/users/:userId/cart',mid.Authentication,mid.Authorisation, cartController.createCart )

router.put('/users/:userId/cart',mid.Authentication , mid.Authorisation , cartController.updateCart )

router.get('/users/:userId/cart',mid.Authentication , mid.Authorisation ,cartController.getCart )

router.delete('/users/:userId/cart' , mid.Authentication , mid.Authorisation ,cartController.deleteCart )

//..........................................Order APIs............................................

router.post('/users/:userId/orders',orderController.createOrder)

router.put('/users/:userId/orders',orderController.updateOrder)

//..........................................APIs Ended..............................................

//for Invalid Params
router.use(function(req,res){
    res.status(400).send({status:false, message:"rout not found"})
})

module.exports = router