const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    foundItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoundItem',
      required: [true, 'Found item is required']
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Claiming student is required']
    },
    reason: {
      type: String,
      required: [true, 'Claim reason is required'],
      trim: true,
      minlength: [10, 'Claim reason must be at least 10 characters'],
      maxlength: [1000, 'Claim reason cannot exceed 1000 characters']
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    }
  },
  { timestamps: true }
);

claimSchema.index({ foundItemId: 1, claimedBy: 1 }, { unique: true });

module.exports = mongoose.model('Claim', claimSchema);
