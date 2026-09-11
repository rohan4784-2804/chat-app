const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true, maxlength: 5000 },
  user: { type: String, default: null },
  clientMessageId: { type: String, default: null, index: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
