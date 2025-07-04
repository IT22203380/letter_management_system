const express = require('express');
const router = express.Router();
const faxController = require('../controllers/faxController');
const upload = require('../middleware/upload.middleware');

// Routes
router.post('/', upload.array('attachments', 10), faxController.createFax);
router.get('/', faxController.getAllFaxes);
router.get('/:id', faxController.getFaxById);
router.put('/:id', upload.array('attachments', 10), faxController.updateFax);
router.delete('/:id', faxController.deleteFax);

module.exports = router;
