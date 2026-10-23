const mongoose = require('mongoose');

function isValidObjectId(value) {
  return typeof value === 'string' && mongoose.isValidObjectId(value);
}

function requiredText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validDateInput(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return !Number.isNaN(date.getTime()) && date <= today;
}

function validPhoneNumber(value) {
  return typeof value === 'string' && /^\d{10}$/.test(value);
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

module.exports = {
  getValidationMessage,
  isValidObjectId,
  requiredText,
  validDateInput,
  validPhoneNumber
};
