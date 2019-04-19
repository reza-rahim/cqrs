var redis = require('redis');
const util = require('util')
const bluebird = require("bluebird");

async function main(){
  var redisHost = process.env.redisHost || '127.0.0.1';
  var redisPort = parseInt(process.env.redisPort) || 6378;

  console.log("conneting to " + redisHost + ":" + redisPort )

  var redisClient = redis.createClient({host : redisHost, port : redisPort});

  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);


  try {
     //var rtn =  await redisClient.send_commandAsync('FT.INFO',['event_store']);
     var rtn =  await redisClient.send_commandAsync('FT.ADD',['event_store', '1', '1.0','FIELDS','orderId', 'orderId' ]);
  
     console.log(rtn)
     
  }
  catch(error) {
    console.log("in..... catch");
    console.error(error);
  }
}

main()
