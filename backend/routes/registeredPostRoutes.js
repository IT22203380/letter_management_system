const express = require('express');
const router = express.Router();
const registeredPostController = require('../controllers/registeredPostController');
const upload = require('../middleware/upload.middleware');

// Routes
router.post('/', upload.array('attachments', 10), registeredPostController.createRegisteredPost);
router.get('/', registeredPostController.getAllRegisteredPosts);
router.get('/:id', registeredPostController.getRegisteredPostById);
router.put('/:id', upload.array('attachments', 10), registeredPostController.updateRegisteredPost);
router.delete('/:id', registeredPostController.deleteRegisteredPost);

module.exports = router;