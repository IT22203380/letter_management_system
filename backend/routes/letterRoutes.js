const express = require('express');
const router = express.Router();
const { Email } = require('../models');
const { Fax } = require('../models');
const { NormalPost } = require('../models');
const { RegisteredPost } = require('../models');

// Get letter statistics and counts
router.get('/counts', async (req, res) => {
  try {
    const [emails, faxes, normalPosts, registeredPosts] = await Promise.all([
      Email.findAll(),
      Fax.findAll(),
      NormalPost.findAll(),
      RegisteredPost.findAll()
    ]);

    const total = emails.length + faxes.length + normalPosts.length + registeredPosts.length;
    
    // Count by status
    const allLetters = [
      ...emails.map(e => ({ ...e.toJSON(), type: 'email' })),
      ...faxes.map(f => ({ ...f.toJSON(), type: 'fax' })),
      ...normalPosts.map(n => ({ ...n.toJSON(), type: 'normal' })),
      ...registeredPosts.map(r => ({ ...r.toJSON(), type: 'registered' }))
    ];

    const pending = allLetters.filter(l => l.status === 'pending').length;
    const processing = allLetters.filter(l => l.status === 'processing').length;
    const completed = allLetters.filter(l => l.status === 'completed').length;

    res.json({
      total,
      normal: normalPosts.length,
      registered: registeredPosts.length,
      email: emails.length,
      fax: faxes.length,
      pending,
      processing,
      completed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get letters by type
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;

    let letters = [];
    
    if (type === 'email') {
      letters = await Email.findAll({ order: [['createdAt', 'DESC']] });
    } else if (type === 'fax') {
      letters = await Fax.findAll({ order: [['createdAt', 'DESC']] });
    } else if (type === 'normal') {
      letters = await NormalPost.findAll({ order: [['createdAt', 'DESC']] });
    } else if (type === 'registered') {
      letters = await RegisteredPost.findAll({ order: [['createdAt', 'DESC']] });
    } else {
      // Get all letters
      const [emails, faxes, normalPosts, registeredPosts] = await Promise.all([
        Email.findAll(),
        Fax.findAll(),
        NormalPost.findAll(),
        RegisteredPost.findAll()
      ]);
      
      letters = [
        ...emails.map(e => ({ ...e.toJSON(), type: 'email' })),
        ...faxes.map(f => ({ ...f.toJSON(), type: 'fax' })),
        ...normalPosts.map(n => ({ ...n.toJSON(), type: 'normal' })),
        ...registeredPosts.map(r => ({ ...r.toJSON(), type: 'registered' }))
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(letters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;