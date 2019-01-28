var Redis = require('../models/redis');
var chunk = require('chunk');
var redisClient = Redis.redisClient

async function  getProduct(productId) {

   let product= await redisClient.hgetallAsync("redisshop:product:"+productId);
   console.log(product);
   
   return product;
}


async function  getProducts() {
   // with multi exec 
     let productsIdx= await redisClient.zrevrangeAsync('redisshop:all-productsSorted',0,10);
     let bat = redisClient.batch();
     let productView = []

     productsIdx.forEach(function(product) {
        //console.log(product)
        // change it to hget
        bat.hgetall('redisshop:product:'+product);
     });

     let products = await bat.execAsync()

     //console.log(products)
     

     //console.log(productView)
     return products;
}
//getProduct('avia')
//getProducts()
module.exports.getProducts = getProducts
module.exports.getProduct = getProduct
