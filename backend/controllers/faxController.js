const { Fax } = require('../models');
const { systemLogger } = require('../utils/logger');

// Create fax
exports.createFax = async (req, res) => {
  try {
    const faxData = { ...req.body };
    
    // Handle file attachments
    if (req.files && req.files.length > 0) {
      const attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path
      }));
      faxData.attachments = attachments;
    }

    const fax = await Fax.create(faxData);
    
    systemLogger.info(`Fax created with ID: ${fax.id}`);
    res.status(201).json({
      status: true,
      message: 'Fax created successfully',
      data: fax
    });
  } catch (error) {
    systemLogger.error(`Error creating fax: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error creating fax',
      error: error.message
    });
  }
};

// Get all faxes
exports.getAllFaxes = async (req, res) => {
  try {
    const faxes = await Fax.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(faxes);
  } catch (error) {
    systemLogger.error(`Error fetching faxes: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error fetching faxes',
      error: error.message
    });
  }
};

// Get fax by ID
exports.getFaxById = async (req, res) => {
  try {
    const fax = await Fax.findByPk(req.params.id);
    
    if (!fax) {
      return res.status(404).json({
        status: false,
        message: 'Fax not found'
      });
    }
    
    res.status(200).json({
      status: true,
      data: fax
    });
  } catch (error) {
    systemLogger.error(`Error fetching fax: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error fetching fax',
      error: error.message
    });
  }
};

// Update fax
exports.updateFax = async (req, res) => {
  try {
    const fax = await Fax.findByPk(req.params.id);
    
    if (!fax) {
      return res.status(404).json({
        status: false,
        message: 'Fax not found'
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
      const existingAttachments = fax.attachments || [];
      updateData.attachments = [...existingAttachments, ...newAttachments];
    }

    await fax.update(updateData);
    
    systemLogger.info(`Fax updated with ID: ${fax.id}`);
    res.status(200).json({
      status: true,
      message: 'Fax updated successfully',
      data: fax
    });
  } catch (error) {
    systemLogger.error(`Error updating fax: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error updating fax',
      error: error.message
    });
  }
};

// Delete fax
exports.deleteFax = async (req, res) => {
  try {
    const fax = await Fax.findByPk(req.params.id);
    
    if (!fax) {
      return res.status(404).json({
        status: false,
        message: 'Fax not found'
      });
    }

    await fax.destroy();
    
    systemLogger.info(`Fax deleted with ID: ${req.params.id}`);
    res.status(200).json({
      status: true,
      message: 'Fax deleted successfully'
    });
  } catch (error) {
    systemLogger.error(`Error deleting fax: ${error.message}`);
    res.status(500).json({
      status: false,
      message: 'Error deleting fax',
      error: error.message
    });
  }
};