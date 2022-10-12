const express = require('express')
const router = express.Router();

const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
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

//


//for Invalid Params
router.use(function(req,res){
    res.status(400).send({status:false, message:"rout not found"})
})

module.exports = router