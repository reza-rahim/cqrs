var redis = require('redis');
var redisHost = process.env.redisHost || 'localhost';
var redisPort = parseInt(process.env.redisPort) || 6379;

console.log("conneting to " + redisHost + ":" + redisPort )

var redisClient = redis.createClient({host : redisHost, port : redisPort});

var products = [  
       {   "key" : "athleticworks",
           "imagePath": 'images/AthleticWorks.jpeg',
           "title": "Athletic Works",
           "description": "Athletic Works Men's Running Shoe",
           "price": "10.00",
       },
       {   "key" : "avia", 
           "imagePath": "images/Avia.jpeg",
           "title": "Avia",
           "description": "Avia Men's Speckled Jogger Athletic Shoe",
           "price": "18.44",
       },
       {   "key" : "fubu", 
           "imagePath": "images/fubu.jpeg",
           "title": "fubu",
           "description": "Fubu Men's Cush Athletic Shoe",
           "price": "17.88",
       },
       {   "key" : "george",
           "imagePath": "images/George.jpeg",
           "title": "George",
           "description": "George Men's Metropolis Dress Shoe",
           "price": "15.00",
       },
       {   "key" : "brahma",
           "imagePath": "images/Brahma.jpeg",
           "title": "Brahma",
           "description": "rahma Men's Raid Steel Toe Work Boot",
           "price": "18.00",
       },
       {   "key" : "palladium",
           "imagePath": "images/Palladium.jpeg",
           "title": "Palladium",
           "description": "Palladium Pallaphoenix OG CVS Sneaker",
           "price": "35.00",
       },
       {   "key" : "vans",
           "imagePath": "images/vans.jpeg",
           "title": "VANS",
           "description": "Vans Unisex MLB Authentic Skate Shoes",
           "price": "15.00",
       }
]


products.forEach(function(value){
  redisClient.multi()

  redisClient.hmset("redisshop:product:"+value.key, "id", value.key, "imagePath", value.imagePath,
                     "title", value.title, "description", value.description, "price", value.price)
  redisClient.sadd("redisshop:all-products", value.key)
  redisClient.zadd("redisshop:all-productsSorted", value.price,value.key)
  redisClient.exec(function (err, replies) {
    //nsole.log(replies); 
  });
  console.log(value.imagePath);
});

//module.exports.products =  products

redisClient.quit()

//SORT redisshop:all-products BY redisshop:product:*->price 
//SORT redisshop:all-products BY redisshop:product:*->price get # get redisshop:product:*->price LIMIT 0 2
// SORT redisshop:all-products BY redisshop:product:*->price get # get redisshop:product:*->imagePath   get redisshop:product:*->price LIMIT 0 2

