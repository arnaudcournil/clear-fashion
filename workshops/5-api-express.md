# ⤵️ Step 5 - Request the Products

> How to give access to your data

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [🎯 Objective](#-objective)
- [🏗 Prerequisites](#%F0%9F%8F%97-prerequisites)
- [⤵️ List of endpoints to implement](#-list-of-endpoints-to-implement)
    - [`GET /products/:id`](#get-productsid)
    - [`GET /products/search`](#get-productssearch)
- [👩‍💻 Just tell me what to do](#%E2%80%8D-just-tell-me-what-to-do)
- [📦 Suggested node modules](#-suggested-node-modules)
- [🛣️ Related Theme and courses](#-related-theme-and-courses)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## 🎯 Objective

**Build an api with Express to request data from your database...**

## 🏗 Prerequisites

1. Be sure **to have a clean working copy**.

This means that you should not have any uncommitted local changes.

```sh
❯ cd /path/to/workspace/clear-fashion
❯ git status
On branch master
Your branch is up to date with 'origin/master'.

nothing to commit, working tree clean
```

2. **Pull** the `master` branch to update your local with the new remote changes

```sh
❯ git remote add upstream git@github.com:92bondstreet/clear-fashion.git
## or ❯ git remote add upstream https://github.com/92bondstreet/clear-fashion
❯ git fetch upstream
❯ git pull upstream master
```

3. **Check the terminal output for the command `node api.js`**

```sh
❯ cd /path/to/workspace/clear-fashion/server
## install new dependencies
❯ yarn
## or ❯ npm install
❯ node api.js
```

<img src="./img/5-api.png" width="75%"/>

## ⤵️ List of endpoints to implement

#### `GET /products/:id`

Fetch a specific product.

```sh
❯ curl -H "Accept: application/json" http://localhost:8092/products/244fa0aa-ba21-59b7-8f74-ba6fed993746
{
  "_id": "244fa0aa-ba21-59b7-8f74-ba6fed993746",
  "link": "https://www.loom.fr/collections/vestiaire-homme/products/le-t-shirt-homme",
  "brand": "loom",
  "price": 25,
  "name": "Le t-shirt",
  "photo":" //cdn.shopify.com/s/files/1/1355/7899/products/XT7oCJ0N-Il-jZBYBddhZdqc0Ilhb7f0USo1_1InOq8.jpg?v=1673023717&width=3000"
}
```

#### `GET /products/search`

Search for specific products

This endpoint accepts the following optional query string parameters:

- `limit` - number of products to return (default: 12)
- `brand` - filter by brand (default: All brands)
- `price` - filter by price (default: All price)


The results array should be sorted by price in ascending way.

```sh
❯ curl -H "Accept: application/json" http://localhost:8092/products/search?limit=10&brand=loom&price=30
{
  "limit": 10,
  "total": 5,
  "results": [
    {
      "_id": "244fa0aa-ba21-59b7-8f74-ba6fed993746",
      "link": "https://www.loom.fr/collections/vestiaire-homme/products/le-t-shirt-homme",
      "brand": "loom",
      "price": 25,
      "name": "Le t-shirt",
      "photo":" //cdn.shopify.com/s/files/1/1355/7899/products/XT7oCJ0N-Il-jZBYBddhZdqc0Ilhb7f0USo1_1InOq8.jpg?v=1673023717&width=3000"
    },
    {
      "_id": "1035e7a1-e4a3-55e0-9650-4594cf563a7f",
      "link": "https://www.loom.fr/collections/vestiaire-homme/products/le-boxer",
      "brand": "loom",
      "price": 20,
      "name": "Le boxer",
      "photo": "//cdn.shopify.com/s/files/1/1355/7899/products/CaJ7HhFr1595H4N4QftXl3CJQgsAZXcd9flFpMhtFFQ.jpg?v=1672828469&width=3000",
    },
    {
      ...
    },
    {
      ...
    },
    {
      ...
    }
  ]
}
```

## 👩‍💻 Just tell me what to do

1. **Install the desktop API client** [Insomnia](https://insomnia.rest)

2. **Check the API endpoint** [`/`](../server/api.js) with insomnia

<img src="./img/5-insomnia.png" />

3. **Implement the endpoints**

4.  **Commit your modification**

```sh
❯ cd /path/to/workspace/clear-fashion
❯ git add -A && git commit -m "feat(get-product): get a specific product"
```

([why following a commit message convention?](https://dev.to/chrissiemhrk/git-commit-message-5e21))

5. **Commit early, commit often**
6. Don't forget **to push before the end of the workshop**

```sh
❯ git push origin master
```

**Note**: if you catch an error about authentication, [add your ssh to your github profile](https://help.github.com/articles/connecting-to-github-with-ssh/).

If you need some helps on git commands, read [git - the simple guide](http://rogerdudler.github.io/git-guide/)


## 📦 Suggested node modules

- [dotenv](https://www.npmjs.com/package/dotenv) - Loads environment variables from .env for nodejs projects
- [express](https://www.npmjs.com/package/express) - Fast, unopinionated, minimalist web framework for node
- [nodemon](https://www.npmjs.com/package/nodemon) - Monitor for any changes in your node.js application and automatically restart the server - perfect for development

## 🛣️ Related Theme and courses

* 📡 [Theme 3 - About RESTful and GraphQL API](https://github.com/92bondstreet/javascript-empire/blob/master/themes/3.md#about-restful-and-graphql-api)
