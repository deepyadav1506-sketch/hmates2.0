const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['boys', 'girls', 'premium'], required: true },
  price: { type: Number, required: true },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  image: { type: String } // base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('Hostel', hostelSchema);
