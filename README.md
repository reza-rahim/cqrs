# cqrs


docker run -d -p 6379:6379 --name redismod redislabs/redismod


node seed/product.js 

# Can be run on different terminal

node  start 

node cqrs/1-OrderCreateCommandHandler.js

node cqrs/2-OrderAggregator.js

node cqrs/3-PaymentEventHandler.js

node cqrs/4-OrderPaymentEventHandler.js

# access the UI
http://localhost:3000/

#reset the Redis 
sh cqrs/reset.sh 
