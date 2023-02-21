const { connect } = require('http2');
const {MongoClient} = require('mongodb');
const fs = require('fs');

var MONGODB_URI = "";
const MONGODB_DB_NAME = 'clearfashion';
var client, db, collection;

async function connectMongoDb(){
    var auth = fs.readFileSync('../../auth.json');
    auth = JSON.parse(auth);
    MONGODB_URI = auth.MONGODB_URI;
    console.log('Connecting to MongoDB ...');
    client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    db =  client.db(MONGODB_DB_NAME)
    collection = db.collection('products');
}

async function productsPushMongoDb(){
    await connectMongoDb();
    console.log('Deleting all products from MongoDB ...');
    await collection.deleteMany({});
    console.log('Pushing new products to MongoDB ...');
    let rawdata = fs.readFileSync('products.json');
    const products = JSON.parse(rawdata);
    products.map(product => {
        product._id = product.uuid;
        delete product.uuid;
    });
    const result = await collection.insertMany(products);    
    console.log(result);
    process.exit(0);
}

async function fetchProducts(brand = undefined, lessThan = undefined, sortedByPrice = false, sortedByDate = false, scrapedLessThanTwoWeeksAgo = false){
    await connectMongoDb();
    console.log('Fetching products from MongoDB ...');
    var result = "none";
    var query = {};
    if (brand != undefined) query.brand = brand;
    if (lessThan != undefined) query.price = {$lt: lessThan};
    result = await collection.find(query);
    if (sortedByPrice) result = result.sort({price: 1});
    if (sortedByDate) result = result.sort({scrapDate: -1});
    result = await result.toArray();
    if (scrapedLessThanTwoWeeksAgo) result = result.filter(product => new Date(product.scrapDate) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
    console.log(result);
    process.exit(0);
}

//productsPushMongoDb();
fetchProducts("Dedicated", 10 ,true, false, true);//brand, lessThan, sortedByPrice, sortedByDate, scrapedLessThanTwoWeeksAgo
