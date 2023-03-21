const { connect } = require('http2');
const {MongoClient} = require('mongodb');
const fs = require('fs');

var MONGODB_URI = "";
const MONGODB_DB_NAME = 'clearfashion';
var client, db, collection;

async function connectMongoDb(){
    MONGODB_URI = process.env.mongoDB;
    console.log('Connecting to MongoDB ...');
    client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    db =  client.db(MONGODB_DB_NAME)
    collection = db.collection('products');
}

async function productsPushMongoDb(){
    await connectMongoDb();
    console.log('Pushing new products to MongoDB ...');
    let rawdata = fs.readFileSync('products.json');
    let products = JSON.parse(rawdata);
    products.map(product => {
        product._id = product.uuid;
        delete product.uuid;
    });
    const alredyExist = await collection.find({}).toArray();
    products = products.filter(product => !alredyExist.some(product2 => product2._id == product._id));
    if(products.length != 0)
    {
        const result = await collection.insertMany(products);
        console.log(result);
    }
    else
    {
        console.log("No new products");
    }
    process.exit(0);
}

async function fetchProducts(brand = undefined, lessThan = null, sortedByPrice = false, sortedByDate = false, scrapedLessThanTwoWeeksAgo = false){
    await connectMongoDb();
    console.log('Fetching products from MongoDB ...');
    var result = "none";
    var query = {};
    return {brand, lessThan};
    if (brand !== undefined) query.brand = brand;
    if (lessThan != null) query.price = {$lt: lessThan};
    result = await collection.find(query);
    /*
    if (sortedByPrice) result = result.sort({price: 1});
    if (sortedByDate) result = result.sort({scrapDate: -1});
    */
    result = await result.toArray();
    /*
    if (scrapedLessThanTwoWeeksAgo) result = result.filter(product => new Date(product.scrapDate) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
    */
    return result;
}

async function fetchProductsByUuid(uuid){
    await connectMongoDb();
    console.log('Fetching products from MongoDB ...');
    var result = "none";
    result = await collection.find({_id: uuid}).toArray();
    return result;
}

module.exports = {
    productsPushMongoDb,
    fetchProducts,
    fetchProductsByUuid
}
//productsPushMongoDb();
//fetchProducts("Dedicated", 10 ,true, false, false);//brand, lessThan, sortedByPrice, sortedByDate, scrapedLessThanTwoWeeksAgo