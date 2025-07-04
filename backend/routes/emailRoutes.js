const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const upload = require('../middleware/upload.middleware');

// Routes
router.post('/', upload.array('attachments', 10), emailController.createEmail);
router.get('/', emailController.getAllEmails);
router.get('/:id', emailController.getEmailById);
router.put('/:id', upload.array('attachments', 10), emailController.updateEmail);
router.delete('/:id', emailController.deleteEmail);

module.exports = router;