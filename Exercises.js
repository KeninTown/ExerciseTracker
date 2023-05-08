const mongoose = require('mongoose');

const exercisesSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: String,
  unixDate: Number
});

const Exercise = mongoose.model('Exercises', exercisesSchema);

module.exports = Exercise;