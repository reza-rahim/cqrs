echo "FT.DROP event_store"  | redis-cli
echo "FT.CREATE event_store SCHEMA aggregateRoot TEXT eventType TEXT id TEXT user TEXT timeStamp NUMERIC NOINDEX SORTABLE data TEXT NOINDEX" | redis-cli
echo "FT.DROP order_view"  | redis-cli
echo "FT.CREATE order_view  SCHEMA user TEXT timeStamp NUMERIC NOINDEX SORTABLE data TEXT NOINDEX" | redis-cli
echo "del StreamCreateOrder StreamOrderAggregate StreamOrderPayment StreamCreatePayment " | redis-cli
echo "del OrderCommandHandler " | redis-cli
