
const express = require('express');
const Hostel = require('../models/Hostel');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');

// ✅ GET all hostels (public)
router.get('/', async (req, res) => {
  try {
    const hostels = await Hostel.find().populate('ownerId', 'name org');
    res.json(hostels);
  } catch (error) {
    console.error('Hostels GET Error:', error);
    res.status(500).json({ error: 'Failed to fetch hostels' });
  }
});

// ✅ GET owner's hostels
// /api/hostels/my?ownerId=...
router.get('/my', async (req, res) => {
  try {
    const { ownerId } = req.query;

    if (!ownerId) {
      return res.status(400).json({ error: 'ownerId is required' });
    }

    const hostels = await Hostel.find({ ownerId });
    res.json(hostels);

  } catch (error) {
    console.error('My Hostels Error:', error);
    res.status(500).json({ error: 'Failed to fetch owner hostels' });
  }
});

// ✅ POST create hostel
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, location, type, price, ownerId, image } = req.body;

    // 🔥 validation
    if (!name || !location || !type || !price || !ownerId) {
      return res.status(400).json({ error: 'All fields including ownerId are required' });
    }

    const hostel = new Hostel({
      name,
      location,
      type,
      price,
      ownerId,
      image
    });

    const savedHostel = await hostel.save();

    res.status(201).json(savedHostel);

  } catch (error) {
    console.error('Hostel POST Error:', error);
    res.status(500).json({ error: 'Failed to add hostel' });
  }
});

// ✅ DELETE hostel
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await Hostel.findByIdAndDelete(id);

    res.json({ message: 'Hostel deleted successfully' });

  } catch (error) {
    console.error('Delete Hostel Error:', error);
    res.status(500).json({ error: 'Failed to delete hostel' });
  }
});

module.exports = router;