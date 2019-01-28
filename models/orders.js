var Redis = require('../models/redis');
var HashMap = require('hashmap');


function escape(str){
  return str.replace(/([,.<>{}\[\]":;!@#$%^&*()\-+=~ ])/g,'\\$1')
}

async function getOrders(user) {
  let redisClient = Redis.redisClient


  let orderView = []

  var rtn =  await redisClient.send_commandAsync('FT.SEARCH',['order_view','@user:'+escape(user), 
                                                              'SORTBY', 'timeStamp', 'DESC'])
  
  console.log(rtn.length)

  for(i = 2; i<= rtn.length; i=i+2){
      console.log("models/orders.js - getOrders()")
      console.log(rtn[i][3])
      orderView.push(JSON.parse(rtn[i][3]))
  }


  //console.log(orderView)
  console.log("---------------------------")
  return orderView
}

async function main(){
  let orderView = getOrders("reza@redislabs.com")
}

//main()

module.exports.getOrders =  getOrders
