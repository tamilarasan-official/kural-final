const express = require('express');
const {
    searchVoters,
    getVoterById,
    getVotersByPart,
    getPartGenderStats,
    getPartNames,
    getVotersByAgeRange
} = require('../controllers/voterController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Voter
 *   description: Voter endpoints
 */

/**
 * @swagger
 * /voter/search:
 *   post:
 *     tags: [Voter]
 *     summary: Search voters
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *               partNo:
 *                 type: string
 *     responses:
 *       200:
 *         description: List of voters
 */
router.route('/search').post(searchVoters);

/**
 * @swagger
 * /voter/part-names:
 *   get:
 *     tags: [Voter]
 *     summary: Get all part names
 *     responses:
 *       200:
 *         description: List of part names
 */
router.route('/part-names').get(getPartNames);

/**
 * @swagger
 * /voter/by-part/{partNumber}:
 *   get:
 *     tags: [Voter]
 *     summary: Get voters by part number
 *     parameters:
 *       - in: path
 *         name: partNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of voters in part
 */
router.route('/by-part/:partNumber').get(getVotersByPart);

/**
 * @swagger
 * /voter/stats/{partNumber}:
 *   get:
 *     tags: [Voter]
 *     summary: Get gender stats for a part
 *     parameters:
 *       - in: path
 *         name: partNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gender stats
 */
router.route('/stats/:partNumber').get(getPartGenderStats);

/**
 * @swagger
 * /voter/{id}:
 *   get:
 *     tags: [Voter]
 *     summary: Get voter by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voter found
 */
router.route('/:id').get(getVoterById);

/**
 * @swagger
 * /voter/age-range:
 *   get:
 *     tags: [Voter]
 *     summary: Get voters by age range
 *     parameters:
 *       - in: query
 *         name: minAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxAge
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of voters in age range
 */
router.route('/age-range').get(getVotersByAgeRange);

module.exports = router;