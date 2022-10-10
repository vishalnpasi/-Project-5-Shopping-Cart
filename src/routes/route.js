const express = require('express')
const router = express.Router();

const userController = require('../controllers/userController')

// User APIs....

router.post('/register',userController.createUser)

router.post('/login',userController.loginUser)

router.post('/user/:userId/profile',userController.getUser)

router.post('/user/:userId/profile',userController.updateUser)



router.use(function(req,res){
    res.status(400).send({status:false, message:"rout not found"})
})

module.exports = router