const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;