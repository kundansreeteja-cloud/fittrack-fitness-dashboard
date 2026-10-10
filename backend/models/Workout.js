const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
  {
    exercise: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true,
      maxlength: [100, 'Exercise name cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Exercise type is required'],
      enum: {
        values: ['Cardio', 'Strength', 'Flexibility', 'HIIT', 'Sports', 'Other'],
        message: 'Type must be one of: Cardio, Strength, Flexibility, HIIT, Sports, Other',
      },
      default: 'Other',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      max: [600, 'Duration cannot exceed 600 minutes'],
    },
    calories: {
      type: Number,
      required: [true, 'Calories burned is required'],
      min: [1, 'Calories must be at least 1'],
      max: [5000, 'Calories cannot exceed 5000'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for search and sorting
workoutSchema.index({ exercise: 'text' });
workoutSchema.index({ date: -1 });
workoutSchema.index({ type: 1 });

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
