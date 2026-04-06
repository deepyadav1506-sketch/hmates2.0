const express = require('express');
const Booking = require('../models/Booking');
const router = express.Router();
const authMiddleware = require('../middleware/authmiddleware');

// GET /api/bookings - Student bookings
router.get('/student', async (req, res) => {
  try {
    const { userId } = req.query;
    const bookings = await Booking.find({ userId }).populate('hostel', 'name');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Student bookings failed' });
  }
});

// GET /api/bookings/owner - Owner bookings by hostel name
router.get('/owner', async (req, res) => {
  try {
    const { hostelNames } = req.query; // comma separated
    if (!hostelNames) return res.status(400).json({ error: 'hostelNames required' });
    
    const names = hostelNames.split(',');
    const bookings = await Booking.find({ hostel: { $in: names } })
      .populate('userId', 'name phone');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Owner bookings failed' });
  }
});

// POST /api/bookings - Create booking
router.post('/', authMiddleware, async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: 'Booking created', booking });
  } catch (error) {
    res.status(500).json({ error: 'Booking creation failed' });
  }
});

module.exports = router;
