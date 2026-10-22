const mongoose = require('mongoose');

function isValidObjectId(value) {
  return typeof value === 'string' && mongoose.isValidObjectId(value);
}

function requiredText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function getValidationMessage(error) {
  if (error?.code === 11000) {
    return 'A student with that college email already exists.';
  }

  if (error?.name === 'ValidationError') {
    return Object.values(error.errors)
      .map((fieldError) => fieldError.message)
      .join(' ');
  }

  return 'A database error occurred. Please try again.';
}

module.exports = { getValidationMessage, isValidObjectId, requiredText };
