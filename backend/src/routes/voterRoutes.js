const express = require('express');
const {
    searchVoters,
    getVoterById,
    getVotersByPart,
    getPartGenderStats,
    getPartNames,
    getVotersByAgeRange,
    createVoter,
    markVoterAsVerified,
    getVoterByEpicNumber,
    updateVoterInfo
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
 * /voter:
 *   post:
 *     tags: [Voter]
 *     summary: Create a new voter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voterId
 *               - fullName
 *               - age
 *               - gender
 *               - address
 *               - partNumber
 *             properties:
 *               voterId:
 *                 type: string
 *               fullName:
 *                 type: string
 *               age:
 *                 type: string
 *               gender:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               familyId:
 *                 type: string
 *               specialCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *               partNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Voter created successfully
 */
router.route('/').post(createVoter);

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
 * /voter/{id}/verify:
 *   put:
 *     tags: [Voter]
 *     summary: Mark voter as verified
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voter marked as verified
 */
router.route('/:id/verify').put(markVoterAsVerified);

/**
 * @swagger
 * /voter/{id}/info:
 *   put:
 *     tags: [Voter]
 *     summary: Update voter additional information
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
 *               dateOfBirth:
 *                 type: string
 *               mobileNumber:
 *                 type: string
 *               whatsappNumber:
 *                 type: string
 *               email:
 *                 type: string
 *               location:
 *                 type: string
 *               aadharNumber:
 *                 type: string
 *               panNumber:
 *                 type: string
 *               membershipNumber:
 *                 type: string
 *               religion:
 *                 type: string
 *               caste:
 *                 type: string
 *               subCaste:
 *                 type: string
 *               category:
 *                 type: string
 *               casteCategory:
 *                 type: string
 *               party:
 *                 type: string
 *               schemes:
 *                 type: string
 *               history:
 *                 type: string
 *               feedback:
 *                 type: string
 *               language:
 *                 type: string
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Voter information updated successfully
 */
router.route('/:id/info').put(updateVoterInfo);

/**
 * @swagger
 * /voter/epic/{epicNumber}:
 *   get:
 *     tags: [Voter]
 *     summary: Get voter by EPIC number
 *     parameters:
 *       - in: path
 *         name: epicNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Voter found
 */
router.route('/epic/:epicNumber').get(getVoterByEpicNumber);

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