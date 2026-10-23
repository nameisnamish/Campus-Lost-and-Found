const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
      match: [/^[A-Za-z][A-Za-z.' -]*$/, 'Full name can contain only letters, spaces, apostrophes, periods, and hyphens']
    },
    email: {
      type: String,
      required: [true, 'College email is required'],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid college email'],
      maxlength: [150, 'Email cannot exceed 150 characters'],
      unique: true
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      maxlength: [100, 'Department cannot exceed 100 characters'],
      match: [/^[A-Za-z][A-Za-z &-]*$/, 'Department can contain only letters, spaces, ampersands, and hyphens']
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [/^\d{10}$/, 'Contact number must contain exactly 10 digits']
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
