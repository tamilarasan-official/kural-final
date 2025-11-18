const express = require('express');
const {
    getAllDynamicFields,
    getDynamicFieldById,
    getDynamicFieldByFieldId,
    createDynamicField,
    updateDynamicField,
    deleteDynamicField,
    getFieldsForForm,
    getFieldsForMobile,
    bulkCreateDynamicFields,
    reorderFields,
    getFieldStats
} = require('../controllers/dynamicFieldController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes (for mobile app to fetch field configurations)
router.get('/mobile/all', getFieldsForMobile);
router.get('/form/:formType', getFieldsForForm);

// Protected admin routes
router.use(protect); // All routes below require authentication

router.route('/')
    .get(getAllDynamicFields)
    .post(createDynamicField);

router.post('/bulk', bulkCreateDynamicFields);
router.put('/reorder', reorderFields);
router.get('/stats', getFieldStats);

router.get('/field/:fieldId', getDynamicFieldByFieldId);

router.route('/:id')
    .get(getDynamicFieldById)
    .put(updateDynamicField)
    .delete(deleteDynamicField);

module.exports = router;