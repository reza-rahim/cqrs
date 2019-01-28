var express = require('express');
const axios = require('axios')
var router = express.Router();

var chunk = require('chunk');
var Redis = require('../models/redis');
var Products = require('../models/product');
var Cart = require ('../models/cart');
var moment = require('moment');
var redisClient = Redis.redisClient
var Product = require('../models/product');
var Order = require('../models/orders');

/* From the redis data base -- */
//router.get('/', function(req, res, next) {
router.get('/', async (req, res, next) => {
    var successMgs = req.flash('success')[0];
     
    // ---
    products = await Product.getProducts()

    // With sort routine
    //products = await Product.getProductsSort()

     // Rest Api
     //let products = await Axios.getProducts()
     //console.log(products)

     var productChunks = [];
     var chunkSize = 3;
     for (var i = 0; i < products.length; i += chunkSize) {
        productChunks.push(products.slice(i, i  + chunkSize));
     }
     res.render('shop/index', { title: 'Shopping cart', products: productChunks, successMgs: successMgs, noMessage: !successMgs });
    
});

router.get('/add-to-cart/:id', async (req, res, next) => {
    var productId = req.params.id;

    var cart = new Cart(req.session.cart ? req.session.cart : {});

    console.log(productId)
    // 
    product = await Product.getProduct(productId)

    //  Rest Api
    //let product = await Axios.getProduct(productId)
    cart.add(product, product.id);
    req.session.cart = cart;
    res.redirect('/');

});

router.get('/reduce/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function (req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function (req, res, next) {
    if(!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    //console.log(req.session.cart)
    //console.log(cart.generateArray())
    return res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', isLoggedIn, function (req, res, next) {
    if(!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    return res.render('shop/checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});


function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/signin');
}

router.post('/checkout', isLoggedIn, async (req, res, next) => {
    if(!req.session.cart) {
        return res.redirect('/shopping-cart');
    }

    //console.log("-------------------------"+req.body)

    cartSess = new Cart(req.session.cart);
    cartArr = cartSess.generateArray();

    var orderNumber = moment().unix()

    let orderPayLoad = {}

    //console.log(cartArr.item.id)
    let lineItems = []
    cartArr.forEach( function(cart){
      let lineItlem = {}
      lineItlem.id = cart.item.id;
      lineItlem.title = cart.item.title;
      lineItlem.qty = cart.qty;
      lineItlem.price = cart.price;
      lineItems.push(lineItlem);
    });

    orderPayLoad.command = 'CreateOrderCommand'
    orderPayLoad.user = req.user.email;
    orderPayLoad.name=req.body.name;
    orderPayLoad.address=req.body.address;
    orderPayLoad.totalQty=cartSess.totalQty;
    orderPayLoad.totalPrice=cartSess.totalPrice;
    orderPayLoad.cardNumber=req.body.cardNumber
    orderPayLoad.cardExpiryMonth=req.body.cardExpiryMonth
    orderPayLoad.cardExpiryYear=req.body.cardExpiryYear
    orderPayLoad.lineItems=lineItems;
    orderPayLoad.timeStamp=moment().unix();
   
    console.log( JSON.stringify(orderPayLoad) )
    
    let rtnVal = await redisClient.xaddAsync('StreamCreateOrder', '*', 'CreateOrderCommand', JSON.stringify(orderPayLoad) )
 
    req.flash('success', 'Order submitted');
    req.session.cart = null;
    res.redirect('/');
});

module.exports = router;
