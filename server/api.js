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

app.get('', async(request, response) => {
  console.log("Requete : /products/search, params : ", request.query);
  var body = {}
  body.success = true;

  var brand = request.query.brand;
  if(!brand) var brand = null;
  if(request.query.price)var lessThan = parseFloat(request.query.price);
  else var lessThan = null;
  if(request.query.limit)var limit = parseInt(request.query.limit);
  else var limit = null;
  var products = await MongoClient.fetchProducts(brand, lessThan);
  var result = products;
  var result = limit !== null ? products.slice(0, limit) : products;

  body.data = {}
  body.data.result = result;

  response.send(body);
});

app.get('/products/search', async (request, response) => {
  console.log("Requete : /products/search, params : ", request.query);
  var body = {}
  body.success = true;

  var brand = request.query.brand;
  if(!brand) var brand = null;
  if(request.query.price)var lessThan = parseFloat(request.query.price);
  else var lessThan = null;
  if(request.query.limit)var limit = parseInt(request.query.limit);
  else var limit = null;
  var products = await MongoClient.fetchProducts(brand, lessThan);
  var result = products;
  var result = limit !== null ? products.slice(0, limit) : products;

  body.data = {}
  body.data.result = result;

  response.send(body);
});

app.get('/products/*', async (request, response) => {
  console.log("Requete : products/:id, params : ", request.params[0]);
  var body = {}
  body.success = true;

  var id = request.params[0];

  var product = await MongoClient.fetchProductsByUuid(id);

  body.data = {}
  body.data.result = product;

  response.send(body);
});

app.get('/brands', async (request, response) => {
  console.log("Requete : /brands, params : ", request.query);
  var body = {}
  body.success = true;

  var brands = await MongoClient.getBrands();

  body.data = {}
  body.data.result = brands;
  response.send(body);
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);