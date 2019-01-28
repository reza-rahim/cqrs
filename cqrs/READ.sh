
echo "XREAD COUNT 100 STREAMS StreamCreateOrder  0" | redis-cli
echo "XREAD COUNT 100 STREAMS StreamCreatePayment  0" | redis-cli
echo "XREAD COUNT 100 STREAMS StreamOrderDemormalize  0" | redis-cli
echo "XREAD COUNT 100 STREAMS StreamOrderPayment  0" | redis-cli

echo 'FT.SEARCH event_store  "*" ' | redis-cli
echo 'FT.SEARCH order_view  "*" ' | redis-cli
