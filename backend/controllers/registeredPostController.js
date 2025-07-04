const { RegisteredPost } = require('../models');
const { systemLogger } = require('../utils/logger');

// Create registered post
exports.createRegisteredPost = async (req, res) => {
  try {
    const postData = { ...req.body };
    
    // Handle file attachments
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path
      }));
      postData.attachments = attachments;
    }

    const post = await RegisteredPost.create(postData);
    
    systemLogger.info(`Registered post created with ID: ${post.id}`);
    res.status(201).json({
      status: true,
      message: 'Registered post created successfully',
      data: post
    });
  } catch (error) {
    systemLogger.error(`Error creating registered post: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error creating registered post',
      error: error.message
    });
  }
};

// Get all registered posts
exports.getAllRegisteredPosts = async (req, res) => {
  try {
    const posts = await RegisteredPost.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(posts);
  } catch (error) {
    systemLogger.error(`Error fetching registered posts: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error fetching registered posts',
      error: error.message
    });
  }
};

// Get registered post by ID
exports.getRegisteredPostById = async (req, res) => {
  try {
    const post = await RegisteredPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: false,
        message: 'Registered post not found'
      });
    }
    
    res.status(200).json({
      status: true,
      data: post
    });
  } catch (error) {
    systemLogger.error(`Error fetching registered post: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error fetching registered post',
      error: error.message
    });
  }
};

// Update registered post
exports.updateRegisteredPost = async (req, res) => {
  try {
    const post = await RegisteredPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: false,
        message: 'Registered post not found'
      });
    }

    const updateData = { ...req.body };
    
    // Handle new file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path
      }));
      
      // Merge with existing attachments
      const existingAttachments = post.attachments || [];
      updateData.attachments = [...existingAttachments, ...newAttachments];
    }

    await post.update(updateData);
    
    systemLogger.info(`Registered post updated with ID: ${post.id}`);
    res.status(200).json({
      status: true,
      message: 'Registered post updated successfully',
      data: post
    });
  } catch (error) {
    systemLogger.error(`Error updating registered post: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error updating registered post',
      error: error.message
    });
  }
};

// Delete registered post
exports.deleteRegisteredPost = async (req, res) => {
  try {
    const post = await RegisteredPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: false,
        message: 'Registered post not found'
      });
    }

    await post.destroy();
    
    systemLogger.info(`Registered post deleted with ID: ${req.params.id}`);
    res.status(200).json({
      status: true,
      message: 'Registered post deleted successfully'
    });
  } catch (error) {
    systemLogger.error(`Error deleting registered post: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error deleting registered post',
      error: error.message
    });
  }
};