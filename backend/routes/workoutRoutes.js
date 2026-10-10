const express = require('express');
const router = express.Router();
const {
  getWorkouts,
  getStats,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
} = require('../controllers/workoutController');

// Stats route must come before /:id to avoid being caught by the param route
router.get('/stats', getStats);

router.route('/').get(getWorkouts).post(createWorkout);

router.route('/:id').get(getWorkout).put(updateWorkout).delete(deleteWorkout);

module.exports = router;
