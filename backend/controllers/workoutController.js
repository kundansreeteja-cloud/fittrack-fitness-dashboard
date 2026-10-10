const Workout = require('../models/Workout');

// @desc    Get all workouts with optional search and filters
// @route   GET /api/workouts
// @access  Public
const getWorkouts = async (req, res) => {
  try {
    const { search, type, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};

    // Text search by exercise name
    if (search && search.trim()) {
      query.exercise = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by type
    if (type && type !== 'All') {
      query.type = type;
    }

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [workouts, total] = await Promise.all([
      Workout.find(query).sort({ date: -1 }).skip(skip).limit(parseInt(limit)),
      Workout.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: workouts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: workouts,
    });
  } catch (error) {
    console.error('getWorkouts error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching workouts', error: error.message });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/workouts/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now);
    // Get last 7 days
    startOfWeek.setDate(now.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const [overallStats, weeklyData] = await Promise.all([
      // Overall aggregation
      Workout.aggregate([
        {
          $group: {
            _id: null,
            totalWorkouts: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            totalCalories: { $sum: '$calories' },
            avgDuration: { $avg: '$duration' },
          },
        },
      ]),
      // Weekly data grouped by day
      Workout.aggregate([
        {
          $match: {
            date: { $gte: startOfWeek },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$date' },
            },
            totalDuration: { $sum: '$duration' },
            totalCalories: { $sum: '$calories' },
            workoutCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Build 7-day chart array (fill missing days with 0)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[d.getDay()];

      const found = weeklyData.find((w) => w._id === dateStr);
      chartData.push({
        day: dayName,
        date: dateStr,
        duration: found ? found.totalDuration : 0,
        calories: found ? found.totalCalories : 0,
        workouts: found ? found.workoutCount : 0,
      });
    }

    const stats = overallStats[0] || {
      totalWorkouts: 0,
      totalDuration: 0,
      totalCalories: 0,
      avgDuration: 0,
    };

    res.json({
      success: true,
      data: {
        totalWorkouts: stats.totalWorkouts,
        totalDuration: Math.round(stats.totalDuration),
        totalCalories: Math.round(stats.totalCalories),
        avgDuration: Math.round(stats.avgDuration || 0),
        weeklyChart: chartData,
      },
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stats', error: error.message });
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Public
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    res.json({ success: true, data: workout });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid workout ID' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create a new workout
// @route   POST /api/workouts
// @access  Public
const createWorkout = async (req, res) => {
  try {
    const { exercise, type, date, duration, calories, notes } = req.body;

    // Basic required field validation
    if (!exercise || !exercise.trim()) {
      return res.status(400).json({ success: false, message: 'Exercise name is required' });
    }
    if (!duration || isNaN(duration) || Number(duration) < 1) {
      return res.status(400).json({ success: false, message: 'Duration must be a positive number (min 1 minute)' });
    }
    if (!calories || isNaN(calories) || Number(calories) < 1) {
      return res.status(400).json({ success: false, message: 'Calories must be a positive number (min 1)' });
    }

    const workout = await Workout.create({
      exercise: exercise.trim(),
      type: type || 'Other',
      date: date ? new Date(date) : new Date(),
      duration: Number(duration),
      calories: Number(calories),
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({ success: true, data: workout, message: 'Workout created successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error('createWorkout error:', error);
    res.status(500).json({ success: false, message: 'Server error creating workout', error: error.message });
  }
};

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Public
const updateWorkout = async (req, res) => {
  try {
    const { exercise, type, date, duration, calories, notes } = req.body;

    // Validate if provided
    if (duration !== undefined && (isNaN(duration) || Number(duration) < 1)) {
      return res.status(400).json({ success: false, message: 'Duration must be a positive number (min 1 minute)' });
    }
    if (calories !== undefined && (isNaN(calories) || Number(calories) < 1)) {
      return res.status(400).json({ success: false, message: 'Calories must be a positive number (min 1)' });
    }

    const updateData = {};
    if (exercise !== undefined) updateData.exercise = exercise.trim();
    if (type !== undefined) updateData.type = type;
    if (date !== undefined) updateData.date = new Date(date);
    if (duration !== undefined) updateData.duration = Number(duration);
    if (calories !== undefined) updateData.calories = Number(calories);
    if (notes !== undefined) updateData.notes = notes.trim();

    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }

    res.json({ success: true, data: workout, message: 'Workout updated successfully' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid workout ID' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error('updateWorkout error:', error);
    res.status(500).json({ success: false, message: 'Server error updating workout', error: error.message });
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Public
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    res.json({ success: true, message: 'Workout deleted successfully', data: workout });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid workout ID' });
    }
    console.error('deleteWorkout error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting workout', error: error.message });
  }
};

module.exports = { getWorkouts, getStats, getWorkout, createWorkout, updateWorkout, deleteWorkout };
