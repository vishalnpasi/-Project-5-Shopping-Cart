const express = require('express')
const router = express.Router();

// const userController = require('../controllers/userController')
// const bookController = require('../controllers/bookController')
// const reviewController = require('../controllers/reviewController')
// const mid = require('../middleware/auth')


router.use(function(req,res){
    res.status(400).send({status:false, message:"rout not found"})
})

module.exports = router