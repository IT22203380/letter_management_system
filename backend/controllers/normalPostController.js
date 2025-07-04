const { NormalPost } = require('../models');
const { systemLogger } = require('../utils/logger');

// Create normal post
exports.createNormalPost = async (req, res) => {
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

    const post = await NormalPost.create(postData);
    
    systemLogger.info(`Normal post created with ID: ${post.id}`);
    res.status(201).json({
      status: true,
      message: 'Normal post created successfully',
      data: post
    });
  } catch (error) {
    systemLogger.error(`Error creating normal post: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error creating normal post',
      error: error.message
    });
  }
};

// Get all normal posts
exports.getAllNormalPosts = async (req, res) => {
  try {
    const posts = await NormalPost.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(posts);
  } catch (error) {
    systemLogger.error(`Error fetching normal posts: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error fetching normal posts',
      error: error.message
    });
  }
};

// Get normal post by ID
exports.getNormalPostById = async (req, res) => {
  try {
    const post = await NormalPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: false,
        message: 'Normal post not found'
      });
    }
    
    res.status(200).json({
      status: true,
      data: post
    });
  } catch (error) {
    systemLogger.error(`Error fetching normal post: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error fetching normal post',
      error: error.message
    });
  }
};

// Update normal post
exports.updateNormalPost = async (req, res) => {
  try {
    const post = await NormalPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: false,
        message: 'Normal post not found'
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
    
    systemLogger.info(`Normal post updated with ID: ${post.id}`);
    res.status(200).json({
      status: true,
      message: 'Normal post updated successfully',
      data: post
    });
  } catch (error) {
    systemLogger.error(`Error updating normal post: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error updating normal post',
      error: error.message
    });
  }
};

// Delete normal post
exports.deleteNormalPost = async (req, res) => {
  try {
    const post = await NormalPost.findByPk(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        status: false,
        message: 'Normal post not found'
      });
    }

    await post.destroy();
    
    systemLogger.info(`Normal post deleted with ID: ${req.params.id}`);
    res.status(200).json({
      status: true,
      message: 'Normal post deleted successfully'
    });
  } catch (error) {
    systemLogger.error(`Error deleting normal post: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error deleting normal post',
      error: error.message
    });
  }
};