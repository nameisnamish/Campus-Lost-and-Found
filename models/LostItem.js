const mongoose = require('mongoose');

const lostItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    lastSeenLocation: {
      type: String,
      required: [true, 'Last-seen location is required'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters']
    },
    dateLost: {
      type: Date,
      required: [true, 'Date lost is required']
    },
    status: {
      type: String,
      enum: ['Lost'],
      default: 'Lost'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Reporting student is required']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostItem', lostItemSchema);
