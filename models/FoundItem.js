const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
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
    foundLocation: {
      type: String,
      required: [true, 'Found location is required'],
      trim: true,
      maxlength: [150, 'Location cannot exceed 150 characters']
    },
    dateFound: {
      type: Date,
      required: [true, 'Date found is required']
    },
    status: {
      type: String,
      enum: ['Available', 'Returned'],
      default: 'Available'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Reporting student is required']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoundItem', foundItemSchema);
