export redisHost="10.0.15.10"
export orderService="http://localhost:3001"
export productService="http://localhost:3001"
#export orderService="http://localhost:8080"
#export productService="http://localhost:8080"

echo "FT.CREATE event_store SCHEMA aggregateRoot TEXT eventType TEXT id TEXT user TEXT timeStamp NUMERIC NOINDEX SORTABLE data TEXT NOINDEX" | redis-cli

echo "FT.CREATE order_view  SCHEMA user TEXT timeStamp NUMERIC NOINDEX SORTABLE data TEXT NOINDEX" | redis-cli


npm start
