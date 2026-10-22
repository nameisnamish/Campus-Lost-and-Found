const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'College email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid college email'],
      unique: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{7,20}$/, 'Enter a valid contact number']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
