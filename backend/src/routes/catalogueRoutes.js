const express = require('express');
const {
    listCatalogueItems,
    getCatalogueItem,
    createCatalogueItem,
    updateCatalogueItem,
    deleteCatalogueItem
} = require('../controllers/catalogueController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Catalogue
 *   description: Catalogue endpoints
 */

/**
 * @swagger
 * /catalogue:
 *   get:
 *     tags: [Catalogue]
 *     summary: List all catalogue items
 *     responses:
 *       200:
 *         description: List of catalogue items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *       429:
 *         description: Too many requests
 */
router.route('/')
    .get(listCatalogueItems)

/**
 * @swagger
 * /catalogue:
 *   post:
 *     tags: [Catalogue]
 *     summary: Create a catalogue item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *           example:
 *             name: Item 1
 *             description: Description of item 1
 *     responses:
 *       200:
 *         description: Catalogue item created
 *       400:
 *         description: Bad request
 */
.post(createCatalogueItem);

/**
 * @swagger
 * /catalogue/{id}:
 *   get:
 *     tags: [Catalogue]
 *     summary: Get catalogue item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catalogue item found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *       404:
 *         description: Item not found
 */
router.route('/:id')
    .get(getCatalogueItem)

/**
 * @swagger
 * /catalogue/{id}:
 *   put:
 *     tags: [Catalogue]
 *     summary: Update catalogue item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *           example:
 *             name: Updated Item
 *             description: Updated description
 *     responses:
 *       200:
 *         description: Catalogue item updated
 *       400:
 *         description: Bad request
 *       404:
 *         description: Item not found
 */
.put(updateCatalogueItem)

/**
 * @swagger
 * /catalogue/{id}:
 *   delete:
 *     tags: [Catalogue]
 *     summary: Delete catalogue item by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Catalogue item deleted
 *       404:
 *         description: Item not found
 */
.delete(deleteCatalogueItem);

module.exports = router;