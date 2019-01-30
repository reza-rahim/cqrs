var redis = require('redis');
const util = require('util')
const bluebird = require("bluebird");
var moment = require('moment');
const uuidv4 = require('uuid/v4');
var sleep = require('system-sleep');

function escape(str){
  return str.replace(/([,.<>{}\[\]":;!@#$%^&*()\-+=~ ])/g,'\\$1')
}


/*
 * Send to domain event to StreamOrderAggregate
 */
async function add_to_Aggregator(redisClient, streamPayload){

   let aggregatePayload = {}
   aggregatePayload.user = streamPayload.user
   aggregatePayload.orderId  = streamPayload.orderId

   console.log("....... Adding  StreamOrderAggregate: " + JSON.stringify(aggregatePayload))

   try{
       var rtn1 =  await redisClient.xaddAsync('StreamOrderAggregate', "*", 
                                               'orderAggregate', 
                                                JSON.stringify(aggregatePayload) )
   }
   catch(error) {
        console.error(error);
   }
}

/*
 *
 */
async function add_to_event_store (redisClient, streamPayload ) {

   console.log("...........Sleeping ........")
   sleep(10000); // 10  seconds

   let orderPayload = {}

   console.log(streamPayload)
   orderPayload.user=streamPayload.user
   orderPayload.orderId=streamPayload.orderId
   orderPayload.status=streamPayload.status
   var timeStamp  = moment().unix()

   let searchKey = '@aggregateRoot: order @user: '+escape(streamPayload.user)+' @id: '+escape(streamPayload.orderId) +' @eventType: PaymentEvent'
   console.log('..... searchKey : ' +searchKey)


   try{
      var rtn =  await redisClient.send_commandAsync('FT.SEARCH',['event_store', searchKey])

      /*
       * If the event does not exists in event_store 
       * then add the event to the even_stote
       */
      if(rtn[0] == 0){
          
           console.log("....... Inserting event store: " + escape(orderPayload.orderId))

           var rtn =  await redisClient.send_commandAsync('FT.ADD',['event_store', uuidv4() , '1.0',
                                                                    'FIELDS', 'aggregateRoot', 
                                                                    'order', 'id', escape(orderPayload.orderId), 
                                                                    'user', escape(orderPayload.user), 
                                                                    'eventType', 'PaymentEvent',
                                                                    'timeStamp', timeStamp, 'data',  
                                                                    JSON.stringify(orderPayload)  ]);
      }

   }
   catch(error) {
       console.error(error);
   }
}

/*
 * Read a domain event from StreamOrderPayment
 * Add a event to event_store
 * Send to domain event to StreamOrderAggregate
 */

async function main(){
  var redisHost = process.env.redisHost || '127.0.0.1';
  var redisPort = parseInt(process.env.redisPort) || 6379;

  console.log("conneting to " + redisHost + ":" + redisPort )

  var redisClient = redis.createClient({host : redisHost, port : redisPort});

  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);


  try {
     var key =  await redisClient.getAsync('OrderPaymentEventHandler');

     if(key == null){
       key = '0-0' 
     }

     for(;;){
        let rtnVal = await redisClient.xreadAsync('COUNT', 10, 'BLOCK',1000,'STREAMS','StreamOrderPayment',key )
        
        //console.log(util.inspect(rtnVal, {showHidden: false, depth: null}))
        if( rtnVal != null){
           for(let j = 0; j < rtnVal[0][1].length; j++){

              key = rtnVal[0][1][j][0];
              console.log("key:"+key)
              let val = rtnVal[0][1][j][1][1];
              let streamPayload = JSON.parse(val);
              console.log(streamPayload.user)

              /*
               * Add to event to event_store
               */
              let rtn1 = await add_to_event_store(redisClient, streamPayload) 

              /*
               * Add domain event to StreamOrderAggregate
               */
              let rtn2 = await add_to_Aggregator(redisClient, streamPayload)

              redisClient.set('OrderPaymentEventHandler',key)           
           }
        }
     }
  }
  catch(error) {
    console.error(error);
  }
}

main()
