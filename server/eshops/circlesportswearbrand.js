function uuidv4() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
  const $ = cheerio.load(data);

  var items = [];
  items.push(...$('li.grid__item')
    .map((i, element) => {
      const image = "https:" + $(element)
        .find('img')[0].attribs['src']
      var images = Object.values($(element).find('.media-pool img.motion-reduce').map((i, e) => e.attribs['data-src']));
      var link = "https://shop.circlesportswear.com" + $(element)
        .find('h3.h5 .full-unstyled-link')
        .attr('href');
      var name = $(element)
        .find('h3.h5 .full-unstyled-link')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      var price = $(element)
          .find('.money')
          .text()
          .split('€');
      price = parseFloat(price[price.length - 1].replace(',', '.'));
      var colorArray = $(element)
          .find('.color-variant');
      var colorArrayFinal = [];
      var colorArrayFinalUrl = [];
      for(i = 0; i < colorArray.length; i++) {
        colorArrayFinal.push(colorArray[i].attribs['data-color']);
        colorArrayFinalUrl.push(colorArray[i].attribs['data-url']);
      }
      colorArray = colorArrayFinal;
      var imagesFinal = [];
      colorArrayFinal.forEach(item => {
        imagesFinal.push(images.filter(obj => !("" + obj).startsWith("<!DOCTYPE html>") && ("" + obj).includes(item.toLowerCase().replace(" ", "_") + "_1"))[0]);
      });
      if(colorArray.length == 1) {
        name = name + " " + colorArray[0];
        link += colorArrayFinalUrl[0];
      }
      else if(colorArray.length > 1) {
        for(i = 1; i < colorArray.length; i++) {
          var item = {
            image: "https:" + imagesFinal[i],
            link: link + colorArrayFinalUrl[i],
            name: name + " " + colorArray[i],
            price: price,
            scrapDate: new Date().toDateString(),
            brand: "Circle Sportswear",
            uuid: uuidv4()
          };
          items.push(item);
        }
        name = name + " " + colorArray[0];
        link += colorArrayFinalUrl[0];
      }
          const scrapDate = new Date().toDateString();
          const brand = "Circle Sportswear";
          const uuid = uuidv4();
          return {image, link, name, price, scrapDate, brand, uuid};
    })
    .get());
  return items;
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const body = await response.text();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
