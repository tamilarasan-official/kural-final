const express = require('express');
const { 
  listCatalogueItems, 
  getCatalogueItem, 
  createCatalogueItem, 
  updateCatalogueItem, 
  deleteCatalogueItem 
} = require('../controllers/catalogueController');

const router = express.Router();

router.route('/')
  .get(listCatalogueItems)
  .post(createCatalogueItem);

router.route('/:id')
  .get(getCatalogueItem)
  .put(updateCatalogueItem)
  .delete(deleteCatalogueItem);

module.exports = router;

