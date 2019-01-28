var redis = require('redis');
const util = require('util')
const bluebird = require("bluebird");
var moment = require('moment');
const uuidv4 = require('uuid/v4');

function escape(str){
  return str.replace(/([,.<>{}\[\]":;!@#$%^&*()\-+=~ ])/g,'\\$1')
}

/*
 * Send a domain event to aggregato so view would be refreshed 
 */
async function add_to_aggregator(redisClient, key, streamPayload){
   let aggregatePayload = {}
   aggregatePayload.user = streamPayload.user
   aggregatePayload.orderId  = streamPayload.orderId
              
   console.log('add_to_aggregator()\n')
   console.log("....... Adding to StreamOrderAggregate: " + JSON.stringify(aggregatePayload))

   try{
       var rtn1 =  await redisClient.send_commandAsync('XADD',['StreamOrderAggregate', 
                                                               "*", 'orderAggregate', 
                                                               JSON.stringify(aggregatePayload) ])      
   }
   catch(error) {
        console.error(error);
   }     
   console.log('\n')
}

/*
 *  Send a payment domain event to StreamCreatePayment ( start a Saga ) 
 */ 

async function add_to_payment(redisClient, key, streamPayload){
   let paymentPayload = {}
   paymentPayload.user=streamPayload.user
   paymentPayload.name=streamPayload.name
   paymentPayload.orderId=streamPayload.orderId
   paymentPayload.totalPrice=streamPayload.totalPrice
   paymentPayload.cardNumber=streamPayload.cardNumber
   paymentPayload.cardExpiryMonth=streamPayload.cardExpiryMonth
   paymentPayload.cardExpiryYear=streamPayload.cardExpiryYear

   console.log('add_to_payment()\n')

   console.log("....... Adding  StreamCreatePayment: " + JSON.stringify(paymentPayload))
   try{
       var rtn1 =  await redisClient.send_commandAsync('XADD',['StreamCreatePayment', key, 
                                                               'paymentPayload', JSON.stringify(paymentPayload) ])
   }
   catch(error) {
       console.error(error);
   }
   console.log('\n')
}

/*
 * First search the event Store to for order id
 * if order isn't found then add the order id to event store
 */
async function add_to_event_store (redisClient, key, streamPayload ) {

   let orderPayload = {}
  
   orderPayload.user=streamPayload.user
   orderPayload.name=streamPayload.name
   orderPayload.address=streamPayload.address
   orderPayload.totalQty=streamPayload.totalQty
   orderPayload.totalPrice=streamPayload.totalPrice
   orderPayload.lineItems=streamPayload.lineItems
   orderPayload.orderId=streamPayload.orderId
   orderPayload.status="submitted"
   var timeStamp  = moment().unix()

   console.log('add_to_event_store()\n')
   let searchKey = '@user: '+escape(streamPayload.user)+' @id: '+escape(streamPayload.orderId)
   console.log('..... searchKey : ' +searchKey)

   try{
      var rtn =  await redisClient.send_commandAsync('FT.SEARCH',['event_store', searchKey , 
                                                                  'SORTBY', 'timeStamp', 
                                                                  'DESC', 'LIMIT', 
                                                                  '0', '1'])
      if(rtn[0] == 0 ) { 
           console.log("....... Inserting event store: " + escape(orderPayload.orderId))

           var rtn =  await redisClient.send_commandAsync('FT.ADD',['event_store', uuidv4() , 
                                                                    '1.0','FIELDS', 
                                                                    'aggregateRoot', 'order', 
                                                                    'id', escape(orderPayload.orderId), 
                                                                    'user', escape(orderPayload.user), 'eventType', 
                                                                    'OrderCreatedEvent', 'timeStamp', 
                                                                    timeStamp, 'data',  
                                                                    JSON.stringify(orderPayload)  ]);
      }
   }
   catch(error) {
       console.error(error);
   }
   console.log('\n')
}

/*
 *  Read the order command event from Stream "StreamCreateOrder" produced by front controler
 *  Add the order event to Event Store
 *  Send a payment domain event to StreamCreatePayment ( start a Saga ) 
 *  Send an aggregater domain event to StreamOrderAggregate 
 */

async function main(){
  var redisHost = process.env.redisHost || '127.0.0.1';
  var redisPort = parseInt(process.env.redisPort) || 6379;

  console.log("conneting to " + redisHost + ":" + redisPort )

  var redisClient = redis.createClient({host : redisHost, port : redisPort});

  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);

  try {

     //Get the offset from redis 
     var key =  await redisClient.getAsync('OrderCommandHandler');

     //if there is no offset start reading from begining
     if(key == null){
       key = '0-0' 
     }

     console.log("Reading from StreamCreateOrder")
     console.log(" \n ")
     for(;;){
        let rtnVal = await redisClient.xreadAsync('COUNT', 10, 
                                                  'BLOCK',1000,'STREAMS',
                                                  'StreamCreateOrder',key )

        if( rtnVal != null){
           for(let j = 0; j < rtnVal[0][1].length; j++){
              key = rtnVal[0][1][j][0]; 

              let val = rtnVal[0][1][j][1][1]; 
              let streamPayload = JSON.parse(val);
              console.log(" Read from StreamCreateOrder: key: "+ key + " ;  val:  " +   val)
              console.log(" \n ")

              // Create a unique order id
              streamPayload.orderId=streamPayload.user+":"+key

              let rtn1 = await add_to_event_store(redisClient, key, streamPayload)

              let rtn2 = await add_to_payment(redisClient, key, streamPayload)
  
              let rtn3 = await add_to_aggregator(redisClient, key, streamPayload)

              console.log(" ----------------------------------\n ")

              redisClient.set('OrderCommandHandler',key)           
 
           }
        }
     }
  }
  catch(error) {
    console.error(error);
  }
}

main()
