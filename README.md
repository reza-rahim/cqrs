# cqrs



docker run -d -p 6379:6379 --name redismod redislabs/redismod

npm -y install 

# load the database with product info
node seed/product.js 

# Can be run on different terminal

# Start the node apps
#### For credit card use 4242424242424242
node  start 

node cqrs/1-OrderCreateCommandHandler.js

node cqrs/2-OrderAggregator.js

node cqrs/3-PaymentEventHandler.js

node cqrs/4-OrderPaymentEventHandler.js

# access the UI
http://localhost:3000/

# reset the Redis 
sh cqrs/reset.sh 
