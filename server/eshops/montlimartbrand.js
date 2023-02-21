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
const parse = async data => {
  const $ = cheerio.load(data);

  return $('div.products-list__block')
    .map(async(i, element) => {
      const link = $(element)
        .find('.product-miniature__thumb-link')
        .attr('href');
      var name = $(element)
        .find('.product-miniature__title .text-reset')
        .text()
        .trim()
        .replace(/\s/g, ' ') +
        " " +
        $(element)
        .find('.product-miniature__color')
        .text()
        .trim()
        .replace(/\s/g, ' ');
      name = name.trim();
      var image = "";
      if($(element).find('video').length > 0) {
        await fetch(link).then(async response => {
          await response.text().then(async body => {
            const $b = cheerio.load(body);
            image = $b('img')[0].attribs['data-src'];
          })
        })
      }
      else {
        image = $(element)
          .find('.product-miniature__thumb img')[0].attribs['data-src'];
      }
      const price = parseFloat(
        $(element)
          .find('.price')
          .text()
      );
      var today = new Date().toLocaleString().substr(0, 10).split("/")
      const scrapDate = today[1] + "-" + today[0] + "-" + today[2];
      const brand = "Montlimart";
      const uuid = uuidv4();
      return {image, link, name, price, scrapDate, brand, uuid};
    })
    .get();
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

      return await Promise.all(await parse(body))
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

module.exports.getLinks = async () => {
  try {
    const response = await fetch("https://www.montlimart.com/");

    if (response.ok) {
      const body = await response.text();
      const $ = cheerio.load(body);
      const links = $('.sub .a-niveau1')
        .map((i, element) => {
          return $(element).attr('href');
        })
        .get();
      return links.filter(link => !link.includes("a-propos"));
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}