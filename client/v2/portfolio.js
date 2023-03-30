// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands
https://clear-fashion-pied.vercel.app/brands

Search for available brands list
*/

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const brandSelect = document.querySelector('#brand-select');
const sortSelect = document.querySelector('#sort-select');
const showOnlySelectSale = document.querySelector('#showOnly-select-sale');
const showOnlySelectNew = document.querySelector('#showOnly-select-new');
const showOnlySelectFavorite = document.querySelector('#showOnly-select-favorite');
const productDiv = document.querySelectorAll(".product");

// current products on the page
let currentProducts = [];
let currentPagination = {};
let brandsCount = 0;
let recentProducts = 0;
let lastRelease = NaN;
let p50 = 0;
let p90 = 0;
let p95 = 0;
let brands = [];
let firstRenderBrands = true;
let favoritesChecked = false;

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand = "All", sortBy = "price-asc", filter = [false, false, false]) => {
  try {
    var data = (JSON.parse(localStorage.getItem("clearfashion-data")) || [])
    var result = [];
    if(data.length == 0 || new Date(data.fetchDate).toISOString().split("T")[0] != new Date(Date.now()).toISOString().split("T")[0]) {
      //update products every day
      const response = await fetch(
        `https://clear-fashion-pied.vercel.app/`
      );
      const body = await response.json();
      if (body.success !== true) {
        console.error(body);
        return {currentProducts, currentPagination};
      }
      result = body.data.result;
      brands = await getBrands();
      localStorage.setItem("clearfashion-data", JSON.stringify({result: result, fetchDate: new Date(Date.now()), brands: brands}));
    } else {
      result = data.result;
      brands = data.brands;
    }
    if(firstRenderBrands) {
      renderBrands(brands);
      firstRenderBrands = false;
    }
    result = brand !== "All" ? result.filter(product => product.brand === brand) : result;
    var fav = (JSON.parse(localStorage.getItem("favorites")) || []);
    /* old way to fetch favorites
    if(fav.length <= 10 && filter[2]) {
      result = fav.map(async id => {
        const response = await fetch(
          `https://clear-fashion-pied.vercel.app/products/` + id
        );
        const body = await response.json();
        if (body.success !== true) {
          console.error(body);
          return {currentProducts, currentPagination};
        }
        console.log(body.data.result[0]);
        return body.data.result[0];
      }
      );
      result = await Promise.all(result);
    }
    */
    // filters
    if(filter[0]) {
      result = result.filter(product => product.price < 50);
    }
    if(filter[1]) {
      result = result.filter(product => (new Date() - new Date(product.scrapDate)) / (1000 * 60 * 60 * 24) < 14);
    }
    if(filter[2]){
      result = result.filter(product => fav.includes(product._id));
    }

    var meta = {
      currentPage: page,
      pageCount: Math.ceil(result.length / size),
      pageSize: size,
      count: result.length
    };
    
    if(sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    }
    else if(sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }
    else if(sortBy === "date-asc") {
      result.sort((a, b) => new Date(b.scrapDate) - new Date(a.scrapDate));
    }
    else if(sortBy === "date-desc") {
      result.sort((a, b) => new Date(a.scrapDate) - new Date(b.scrapDate));
    }

    brandsCount = 0
    if(result.length > 0){
      result.reduce((acc, product) => {
        if(!acc[product.brand]) {
          acc[product.brand] = 1;
          brandsCount++;
        }
        return acc;
      }, {});
    };

    recentProducts = result.filter(product => (new Date() - new Date(product.scrapDate)) / (1000 * 60 * 60 * 24) < 14).length;

    lastRelease = result.length > 0 ? result.reduce(function(a,b) {
      return new Date(a.scrapDate) > new Date(b.scrapDate) ? a : b;
    }).scrapDate : "Nan";

    if(result.length > 0)
    {
      p50 = [...result].sort((a, b) => a.price - b.price)[Math.floor(result.length / 2)].price;
      p90 = [...result].sort((a, b) => a.price - b.price)[Math.floor(result.length * 0.9)].price;
      p95 = [...result].sort((a, b) => a.price - b.price)[Math.floor(result.length * 0.95)].price;
    }
    else
    {
      p50 = 0;
      p90 = 0;
      p95 = 0;
    }

    var result = result.slice((page - 1) * size, page * size);
    return {result, meta};
    
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  let i = -1;
  const template = products
    .map(product => {
      i++;
      return `
      <div class="product" id=${product._id}>
        <a href="${product.link}" target="_blank">
        <img src="${product.image}" alt="${product.name}" />
        <div class="product-info">
        <span style="color:red">${product.brand}</span>
        <span>${product.name}</span>
        <span style="font-weight:bold">${product.price != null ? product.price + " €" : ""}</span></a>
        <span id="${product._id}-fav">`
      + ((JSON.parse(localStorage.getItem("favorites")) || []).includes(product._id) ? `<button onclick="deleteToFavorite(currentProducts[${i}]._id)">💔 Delete from favorite</button>` : `<button onclick="addToFavorite(currentProducts[${i}]._id)">❤️ Add to favorite</button>`) + `
      </span>
      </div></div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '';
  sectionProducts.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};


const renderBrands = brands => {
  const options = brands
    .map(brand => `<option value="${brand}">${brand}</option>`)
    .join('');

  brandSelect.innerHTML = options;
};

const renderBrandsCount = () => {
  const spanNbBrands = document.querySelector('#nbBrands');
  spanNbBrands.innerHTML = brandsCount;
};

const renderRecentProducts = () => {
  const spanNbRecentProducts = document.querySelector('#nbRecentProducts');
  spanNbRecentProducts.innerHTML = recentProducts;
};

const renderLastRelease = () => {
  const spanLastReleased = document.querySelector('#spanLastReleased');
  spanLastReleased.innerHTML = lastRelease;
};

const renderStats = () => {
  const spanP50 = document.querySelector('#spanP50');
  spanP50.innerHTML = p50;
  const spanP90 = document.querySelector('#spanP90');
  spanP90.innerHTML = p90;
  const spanP95 = document.querySelector('#spanP95');
  spanP95.innerHTML = p95;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderBrandsCount();
  renderRecentProducts();
  renderLastRelease();
  renderStats();
};

async function getBrands() {
  try {
    const response = await fetch(
      'https://clear-fashion-pied.vercel.app/brands'
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(error);
    }
    else {
      var brands = body.data.result;
      brands.unshift("All");
      return brands;
    }
  } catch (error) {
    console.error(error);
  }
}

function addToFavorite(product) {
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.push(product);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  document.getElementById(product + "-fav").innerHTML = `<button onclick="deleteToFavorite('` + product + `')">💔 Delete from favorite</button>`;
}

async function deleteToFavorite(product) {
  var favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(favorite => favorite != product);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  document.getElementById(product + "-fav").innerHTML = `<button onclick="addToFavorite('` + product + `')">❤️ Add to favorite</button>`;
  if(favoritesChecked){
    const products = await fetchProducts(1, currentPagination.pageSize, brandSelect.value, sortSelect.value, [showOnlySelectSale.checked, showOnlySelectNew.checked, favoritesChecked]);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
}

async function changeFavorites() {
  showOnlySelectFavorite.innerHTML = favoritesChecked ? "Show favorites" : "Show all";
  favoritesChecked = !favoritesChecked;
  const products = await fetchProducts(1, currentPagination.pageSize, brandSelect.value, sortSelect.value, [showOnlySelectSale.checked, showOnlySelectNew.checked, favoritesChecked]);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
}

selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(1, parseInt(event.target.value), brandSelect.value, sortSelect.value, [showOnlySelectSale.checked, showOnlySelectNew.checked, favoritesChecked]);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize, brandSelect.value, sortSelect.value, [showOnlySelectSale.checked, showOnlySelectNew.checked, favoritesChecked]);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

brandSelect.addEventListener('change', async (event) => {
  const products = await fetchProducts(1, currentPagination.pageSize, event.target.value, sortSelect.value, [showOnlySelectSale.checked, showOnlySelectNew.checked, favoritesChecked]);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

sortSelect.addEventListener('change', async (event) => {
  const products = await fetchProducts(1, currentPagination.pageSize, brandSelect.value, event.target.value, [showOnlySelectSale.checked, showOnlySelectNew.checked, favoritesChecked]);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

showOnlySelectSale.addEventListener('change', async (event) => {
  const products = await fetchProducts(1, currentPagination.pageSize, brandSelect.value, sortSelect.value, [event.target.checked, showOnlySelectNew.checked, favoritesChecked]);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

showOnlySelectNew.addEventListener('change', async (event) => {
  const products = await fetchProducts(1, currentPagination.pageSize, brandSelect.value, sortSelect.value, [showOnlySelectSale.checked, event.target.checked,favoritesChecked]);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});



document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});