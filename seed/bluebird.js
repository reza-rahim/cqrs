var redis = require('redis');
var chunk = require('chunk');
var HashMap = require('hashmap');
const bluebird = require("bluebird");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var redisClient = redis.createClient({host : 'localhost', port : 6379});

var user="reza@redislabs.com"
//let orders = []
let orderView = []

async function main() {

  var  ordersHash = new HashMap();
  let ordersRedis = await redisClient.smembersAsync('all-orders:'+user);

  //console.log('ordersRedis', ordersRedis.toString());

  var mulOrder = redisClient.multi();
  var mulCarts = redisClient.multi();

  ordersRedis.forEach(function(order) {
     mulOrder.hmget('orders:'+order, 'user', 'orderNumber', 'totalQty','totalPrice')
     mulCarts.smembersAsync('all-carts:'+order)
  })

  let allorders = await mulOrder.execAsync()

  allorders.forEach(function(order) {
     orderObj = {}
     orderObj.items = []
     orderObj.user =order[0]
     orderObj.orderNumber =order[1]
     orderObj.totalQty =order[2]
     orderObj.totalPrice =order[3]
     ordersHash.set(orderObj.orderNumber, orderObj)
  })
  //console.log('ordersRedis', allorders );

  let cartsRedis = await mulCarts.execAsync()
  //console.log('cartsRedis', cartsRedis);

  var mulCartsDetail = redisClient.multi();
  cartsRedis.forEach(function(carts) {
    carts.forEach(function(cart) {
       mulCartsDetail.hmget('carts:'+cart, 'user', 'orderNumber', 'cart','id', 'title', 'qty', 'price')
       //console.log('carts:'+cart)
    })
  })

  let allcarts = await mulCartsDetail.execAsync()
  //console.log('carts:', allcarts);

  allcarts.forEach(function(cart){
     var cartObj = {}
     cartObj.user=cart[0]
     cartObj.orderNumber=cart[1]
     cartObj.cart=cart[2]
     cartObj.id=cart[3]
     cartObj.title=cart[4]
     cartObj.qty=cart[5]
     cartObj.price=cart[6]
     ordersHash.get(cart[1]).items.push(cartObj)     
  })

  ordersHash.forEach(function(value, key) {
    orderView.push(value)
  });
  console.log(orderView);
}

main()
