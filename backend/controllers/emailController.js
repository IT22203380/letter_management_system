const { Email } = require('../models');
const { systemLogger } = require('../utils/logger');

// Create email
exports.createEmail = async (req, res) => {
  try {
    const emailData = { ...req.body };
    
    // Handle file attachments
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path
      }));
      emailData.attachments = attachments;
    }

    const email = await Email.create(emailData);
    
    systemLogger.info(`Email created with ID: ${email.id}`);
    res.status(201).json({
      status: true,
      message: 'Email created successfully',
      data: email
    });
  } catch (error) {
    systemLogger.error(`Error creating email: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error creating email',
      error: error.message
    });
  }
};

// Get all emails
exports.getAllEmails = async (req, res) => {
  try {
    const emails = await Email.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(emails);
  } catch (error) {
    systemLogger.error(`Error fetching emails: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error fetching emails',
      error: error.message
    });
  }
};

// Get email by ID
exports.getEmailById = async (req, res) => {
  try {
    const email = await Email.findByPk(req.params.id);
    
    if (!email) {
      return res.status(404).json({
        status: false,
        message: 'Email not found'
      });
    }
    
    res.status(200).json({
      status: true,
      data: email
    });
  } catch (error) {
    systemLogger.error(`Error fetching email: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error fetching email',
      error: error.message
    });
  }
};

// Update email
exports.updateEmail = async (req, res) => {
  try {
    const email = await Email.findByPk(req.params.id);
    
    if (!email) {
      return res.status(404).json({
        status: false,
        message: 'Email not found'
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
      const existingAttachments = email.attachments || [];
      updateData.attachments = [...existingAttachments, ...newAttachments];
    }

    await email.update(updateData);
    
    systemLogger.info(`Email updated with ID: ${email.id}`);
    res.status(200).json({
      status: true,
      message: 'Email updated successfully',
      data: email
    });
  } catch (error) {
    systemLogger.error(`Error updating email: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error updating email',
      error: error.message
    });
  }
};

// Delete email
exports.deleteEmail = async (req, res) => {
  try {
    const email = await Email.findByPk(req.params.id);
    
    if (!email) {
      return res.status(404).json({
        status: false,
        message: 'Email not found'
      });
    }

    await email.destroy();
    
    systemLogger.info(`Email deleted with ID: ${req.params.id}`);
    res.status(200).json({
      status: true,
      message: 'Email deleted successfully'
    });
  } catch (error) {
    systemLogger.error(`Error deleting email: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error deleting email',
      error: error.message
    });
  }
};