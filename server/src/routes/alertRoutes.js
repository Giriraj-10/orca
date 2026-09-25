const express = require('express');
const router = express.Router();
const { getAlerts, createAlert } = require('../controllers/alertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getAlerts);
router.post('/', protect, authorize('Authority', 'Administrator'), createAlert);

module.exports = router;
