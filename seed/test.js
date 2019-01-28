var redis = require('redis');
var chunk = require('chunk');
var redisClient = redis.createClient({host : 'localhost', port : 6379});
const {promisify} = require('util');
const getAsync = promisify(redisClient.get).bind(redisClient);
const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
const smembersAsync = promisify(redisClient.smembers).bind(redisClient);



var user="reza@redislabs.com"
var orders = []
var ordersView = []

var carts = []
var cartsView = []

redisClient.

/*
smembersAsync('all-orders:'+user).then(function (result) { orders=result });

console.log(orders)

orders.forEach(function(order){
   hgetallAsync('orders:'+user+':'+order).then(function (result) { ordersView.push(result) });
   smembersAsync('all-carts:'+user+':'+order).then(function (result) { carts=result });
   carts.forEach(function(cart){
      hgetallAsync('carts:'+user+':'+order+':'+cart).then(function (result) { cartsView.push(result) });
   })
})

*/

console.log(cartsView)
