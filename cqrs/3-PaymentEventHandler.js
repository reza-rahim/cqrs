var redis = require('redis');
const util = require('util')
const bluebird = require("bluebird");
var moment = require('moment');


/*
 *
 * Read a domain event from StreamCreatePayment
 * simulate a credit card charge
 * Sent a domain event to StreamOrderPayment
 *
 */

async function main(){
  var redisHost = process.env.redisHost || '127.0.0.1';
  var redisPort = parseInt(process.env.redisPort) || 6379;

  console.log("conneting to " + redisHost + ":" + redisPort )

  var redisClient = redis.createClient({host : redisHost, port : redisPort});

  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);


  try {
     var key =  await redisClient.getAsync('PaymentEventHandler');

     if(key == null){
       key = '0-0' 
     }

     for(;;){

        let rtnVal = await redisClient.xreadAsync('COUNT', 10, 'BLOCK',1000,'STREAMS','StreamCreatePayment',key )
        
        //console.log(util.inspect(rtnVal, {showHidden: false, depth: null}))
        if( rtnVal != null){

           for(let j = 0; j < rtnVal[0][1].length; j++){

              key = rtnVal[0][1][j][0]; 
              console.log("key:"+key)
              let val = rtnVal[0][1][j][1][1]; 
              let streamPayload = JSON.parse(val);
              console.log(streamPayload)

              let paymentPayload = {}

              paymentPayload.user=streamPayload.user
              paymentPayload.orderId=streamPayload.orderId

              /*
               * If order is over $100 deny the order
               * otherwise approve it
               */
              if( streamPayload.totalPrice > 100){

                 paymentPayload.status = 'denied'

              } else {

                 paymentPayload.status = 'approved'
              }

              /*
               * Send domain event to the StreamOrderPayment
               */
              
              try {
              let rtn =  await redisClient.send_commandAsync('XADD',['StreamOrderPayment', key, 
                                                             'paymentPayload', JSON.stringify(paymentPayload) ])
              }
                  catch(error) {
                     console.error(error);
              }

              console.log("--------------------------------------------")
              redisClient.set('PaymentEventHandler',key)           
           }
        }
     }
  }
  catch(error) {
    console.error(error);
  }
}

main()
