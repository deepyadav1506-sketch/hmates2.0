const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  org: { type: String, default: '' },
  role: { type: String, enum: ['student', 'owner'], required: true },
  pass: { type: String, required: true }, // hashed
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('pass')) {
    this.pass = await bcrypt.hash(this.pass, 12);
  }
  next();
});

userSchema.methods.comparePass = async function(candidatePass) {
  return bcrypt.compare(candidatePass, this.pass);
};

module.exports = mongoose.model("User", userSchema);