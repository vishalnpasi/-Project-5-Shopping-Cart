const express = require('express')
const router = express.Router();

const userController = require('../controllers/userController')
const mid = require('../middleware/mid')

// User APIs....

router.post('/register',userController.createUser)

router.post('/login',userController.loginUser)

router.get('/user/:userId/profile',mid.Authentication , mid.Authorisation , userController.getUser)

router.put('/user/:userId/profile',mid.Authentication , mid.Authorisation , userController.updateUser)



router.use(function(req,res){
    res.status(400).send({status:false, message:"rout not found"})
})

module.exports = router