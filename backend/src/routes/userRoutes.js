const express = require('express');
const { getUsers, getUser, updateUser, deleteUser, getBoothCount } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes below use protect middleware
router.use(protect);

router.route('/')
    .get(authorize('admin', 'Assembly Incharge'), getUsers);

router.route('/booth-count')
    .get(getBoothCount);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(authorize('admin'), deleteUser);

module.exports = router;