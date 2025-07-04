const express = require('express');
const router = express.Router();
const normalPostController = require('../controllers/normalPostController');
const upload = require('../middleware/upload.middleware');

// Routes
router.post('/', upload.array('attachments', 10), normalPostController.createNormalPost);
router.get('/', normalPostController.getAllNormalPosts);
router.get('/:id', normalPostController.getNormalPostById);
router.put('/:id', upload.array('attachments', 10), normalPostController.updateNormalPost);
router.delete('/:id', normalPostController.deleteNormalPost);

module.exports = router;