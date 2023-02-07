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

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};
let brandsCount = 0;
let recentProducts = 0;

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const brandSelect = document.querySelector('#brand-select');
const sortSelect = document.querySelector('#sort-select');
const showOnlySelect = document.querySelector('#showOnly-select');

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
const fetchProducts = async (page = 1, size = 12, brand = "all", sortBy = "price-asc", filter = "all") => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?size=999` + (brand !== "all" ? `&brand=${brand}` : "")
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }
    var result = body.data.result;
    
    // filters
    if(filter === "sale") {
      result = result.filter(product => product.price < 50);
    }
    else if(filter === "new") {
      result = result.filter(product => (new Date() - new Date(product.released)) / (1000 * 60 * 60 * 24) < 14);
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
      result.sort((a, b) => new Date(b.released) - new Date(a.released));
    }
    else if(sortBy === "date-desc") {
      result.sort((a, b) => new Date(a.released) - new Date(b.released));
    }

    brandsCount = 0
    result.reduce((acc, product) => {
      if(!acc[product.brand]) {
        acc[product.brand] = 1;
        brandsCount++;
      }
      return acc;
    }, {});

    recentProducts = result.filter(product => (new Date() - new Date(product.released)) / (1000 * 60 * 60 * 24) < 14).length;

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
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
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

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderBrandsCount();
  renderRecentProducts();
};

async function fetchBrands() {
  try {
    const response = await fetch(
      'https://clear-fashion-api.vercel.app/brands'
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(error);
    }
    else {
      var brands = body.data.result;
      brands.unshift("all");
      renderBrands(brands);
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, parseInt(event.target.value), brandSelect.value, sortSelect.value, showOnlySelect.value);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize, brandSelect.value, sortSelect.value, showOnlySelect.value);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

brandSelect.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize, event.target.value, sortSelect.value, showOnlySelect.value);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

sortSelect.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize, brandSelect.value, event.target.value, showOnlySelect.value);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

showOnlySelect.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize, brandSelect.value, sortSelect.value, event.target.value);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

fetchBrands();