/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./eshops/dedicatedbrand');
const montlimartbrand = require('./eshops/montlimartbrand');
const circlesportswear = require('./eshops/circlesportswearbrand');

const link = [
  "https://shop.circlesportswear.com/collections/all", //tout le site
  "https://www.montlimart.com/99-vetements", //tout le site
  "https://www.montlimart.com/14-chaussures",
  "https://www.montlimart.com/15-accessoires",
  "dedicatedbrand"//tout le site
]

async function sandbox (eshop = undefined, number = -1) {
  if(number == -1 && eshop == undefined)
  {
    var allProducts = [];
    for(var i = 0; i < link.length; i++)
    {
      allProducts.push(...await sandbox(link[i], i));
    }
    const fs = require('fs');
 
    let data = JSON.stringify(allProducts);
    fs.writeFileSync('products.json', data);
    console.log("Products in the json file: " + allProducts.length);
    process.exit(0);
  }
  else
  {
    try {
      console.log(`🕵️‍♀️  browsing ${eshop} eshop`);
      var products = "";
      if(eshop.includes('montlimart')){
        products = await montlimartbrand.scrape(eshop);
      }
      else if(eshop == 'dedicatedbrand'){
        products = await dedicatedbrand.getProducts();
      }
      else if(eshop.includes('dedicatedbrand')){//only fourty first products
        products = await dedicatedbrand.scrape(eshop);
      }
      else if(eshop.includes('circlesportswear')){
        products = await circlesportswear.scrape(eshop);
      }
      else
      {
        console.log('eshop not found');
        process.exit(1);
      }
      console.log(products);
      console.log('done ' + products.length + ' products found');
      if(number == -1)
      {
        process.exit(0);
      }
      return products;
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);