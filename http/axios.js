const axios = require('axios'); // promised based requests - like fetch()


//export orderService="http://localhost:3001"
//export productService="http://localhost:3001"

var orderService = process.env.orderService || 'http://backendSevrice:3001';
var productService = process.env.productService || 'http://backendSevrice:3001';

console.log(orderService)
console.log(productService)

async function createOrders(payLoad) {

  console.log(payLoad)
  axios.post(orderService+'/createOrders', payLoad )
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
}


async function getOrders(user) {
  try {
    var instance =  axios.create({
        baseURL: orderService+'/getOrders/'+user,
        timeout: 3000,
        headers: {'X-Custom-Header': 'foobar'}
    });

    const orders = await instance.get();
    //console.log(wes.data); // mediocre code
    return orders.data
  } catch (e) {
    console.error(e); // 
  }
}


async function getProducts() {
  try {
    var instance =  axios.create({
        baseURL: productService+'/getProducts',
        timeout: 3000,
        headers: {'X-Custom-Header': 'foobar'}
    });
    
    const products = await instance.get();
    //console.log(wes.data); // mediocre code
    return products.data
  } catch (e) {
    console.error(e); // 
  }
}


async function getProduct(productId) {
  try {
    var instance =  axios.create({
        baseURL: productService+'/getProduct/'+productId,
        timeout: 3000,
        headers: {'X-Custom-Header': 'foobar'}
    });

    const product = await instance.get();
    console.log(product.data); // mediocre code
    return product.data
  } catch (e) {
    console.error(e); //
  }
}

//getProducts();
module.exports.getProducts = getProducts
module.exports.getProduct = getProduct
module.exports.getOrders = getOrders
module.exports.createOrders = createOrders

