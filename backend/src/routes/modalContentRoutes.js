const express = require('express');
const {
    getModalContent,
    getAllModalContent,
    createOrUpdateModalContent,
    deleteModalContent
} = require('../controllers/modalContentController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ModalContent
 *   description: Modal content endpoints
 */

/**
 * @swagger
 * /modal-content:
 *   get:
 *     tags: [ModalContent]
 *     summary: Get all modal content
 *     responses:
 *       200:
 *         description: List of modal content
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   modalType:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *       429:
 *         description: Too many requests
 */
router.route('/').get(getAllModalContent);

/**
 * @swagger
 * /modal-content/{modalType}:
 *   get:
 *     tags: [ModalContent]
 *     summary: Get modal content by type
 *     parameters:
 *       - in: path
 *         name: modalType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Modal content found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 modalType:
 *                   type: string
 *                 title:
 *                   type: string
 *                 content:
 *                   type: string
 *       404:
 *         description: Modal content not found
 */
router.route('/:modalType').get(getModalContent);

/**
 * @swagger
 * /modal-content:
 *   post:
 *     tags: [ModalContent]
 *     summary: Create or update modal content
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modalType:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *           example:
 *             modalType: info
 *             title: Information
 *             content: Some content here
 *     responses:
 *       200:
 *         description: Modal content created/updated
 *       400:
 *         description: Bad request
 *       429:
 *         description: Too many requests
 */
router.route('/').post(createOrUpdateModalContent);

/**
 * @swagger
 * /modal-content/{modalType}:
 *   delete:
 *     tags: [ModalContent]
 *     summary: Delete modal content by type
 *     parameters:
 *       - in: path
 *         name: modalType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Modal content deleted
 *       404:
 *         description: Modal content not found
 */
router.route('/:modalType').delete(deleteModalContent);

module.exports = router;