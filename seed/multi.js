var redis = require('redis');
var chunk = require('chunk');
var redisClient = redis.createClient({host : 'localhost', port : 6379});

var user="reza@redislabs.com"
var orders = []
var ordersView = []

var carts = []
var cartsView = []


//   redisClient.multi().hmget('redisshop:product:avia','id','imagePath','title','description','price').hmget('redisshop:product:george','id','imagePath','title','description','price').exec(function(err,allResponses) {  allResponses.forEach(function (resp){ console.log(resp)}) });

/*
redisClient.smembers('redisshop:all-products', function(err, products) {   
    var mul = redisClient.multi();
    products.forEach(function(product) { 
    mul.hmget('redisshop:product:'+product,'id','imagePath','title','description','price');
   });

    mul.exec(function(err,allResponses) {  allResponses.forEach(function (resp){
        console.log(resp[0])}) 
        redisClient.quit
        process.exit()
    });
});
     
redisClient.zrevrange('redisshop:all-productsSorted',0,10, function(err, products) {
    var mul = redisClient.multi();
    products.forEach(function(product) {
    mul.hmget('redisshop:product:'+product,'id','imagePath','title','description','price');
   });

    mul.exec(function(err,allResponses) {  allResponses.forEach(function (resp){
        console.log(resp)})
        redisClient.quit
        process.exit()
    });
});

*/

redisClient.smembers('all-orders:'+'reza@redislabs.com', function(err, orders) {   
   var mul = redisClient.multi();
   orders.forEach(function(order) { 
       mul.hmget('orders:reza@redislabs.com:'+order,'totalQty','totalPrice');
   });

   mul.exec(function(err,allResponses) {  allResponses.forEach(function (resp){
        console.log(resp)}) 
   });
   
});
