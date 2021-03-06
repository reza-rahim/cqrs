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
  
  //console.log(rtn)

  for(i = 2; i<= rtn.length; i=i+2){
      console.log("models/orders.js - getOrders()")
      
      for( j = 0; j < 6 ; j++ ){
         if( rtn[i][j] == 'data'){
            //console.log(rtn[i][j+1])
            orderView.push(JSON.parse(rtn[i][j+1]))
         }
      }
  }


  console.log(orderView)
  console.log("---------------------------")
  return orderView
}

async function main(){
  let orderView = getOrders("reza@redislabs.com")
}

//main()

module.exports.getOrders =  getOrders
