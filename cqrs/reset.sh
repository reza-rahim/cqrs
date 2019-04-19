echo "FT.DROP event_store"  | redis-cli -p 6378
echo "FT.CREATE event_store SCHEMA aggregateRoot TEXT eventType TEXT id TEXT user TEXT timeStamp NUMERIC NOINDEX SORTABLE data TEXT NOINDEX" | redis-cli -p 6378
echo "FT.DROP order_view"  | redis-cli -p 6378
echo "FT.CREATE order_view  SCHEMA user TEXT timeStamp NUMERIC NOINDEX SORTABLE data TEXT NOINDEX" | redis-cli -p 6378
echo "del StreamCreateOrder StreamOrderAggregate StreamOrderPayment StreamCreatePayment " | redis-cli -p 6378
echo "del OrderCommandHandler " | redis-cli -p 6378
