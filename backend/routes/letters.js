const express = require('express');
const Letter = require('../models/Letter');
const router = express.Router();

// Create a new letter
router.post('/', async (req, res) => {
  try {
    const letter = await Letter.create(req.body);
    res.status(201).json(letter);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create letter', error: err.message });
  }
});

// Get all letters
router.get('/', async (req, res) => {
  try {
    const letters = await Letter.findAll();
    res.json(letters);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch letters', error: err.message });
  }
});

// Get one letter by ID
router.get('/:id', async (req, res) => {
  try {
    const letter = await Letter.findByPk(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });
    res.json(letter);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch letter', error: err.message });
  }
});

// Update letter
router.put('/:id', async (req, res) => {
  try {
    const letter = await Letter.findByPk(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });
    await letter.update(req.body);
    res.json(letter);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update letter', error: err.message });
  }
});

// Delete letter
router.delete('/:id', async (req, res) => {
  try {
    const letter = await Letter.findByPk(req.params.id);
    if (!letter) return res.status(404).json({ message: 'Letter not found' });
    await letter.destroy();
    res.json({ message: 'Letter deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete letter', error: err.message });
  }
});

module.exports = router;