const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const MongoClient = require('./mongoDb');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/products/search', async (request, response) => {
  console.log("Requete : /products/search, params : ", request.query);
  var brand = request.query.brand;
  if(!brand) var brand = null;
  var lessThan = null;//parseFloat(request.query.price);
  var limit = parseInt(request.query.limit);
  var products = await MongoClient.fetchProducts(brand, lessThan);
  var result = products;
  //var result = limit !== null ? products.slice(0, limit) : products;

  response.send(result);
});

app.get('/products/*', async (request, response) => {
  console.log("Requete : products/:id, params : ", request.params[0]);

  var id = request.params[0];

  var product = await MongoClient.fetchProductsByUuid(id);

  response.send(product);
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);
