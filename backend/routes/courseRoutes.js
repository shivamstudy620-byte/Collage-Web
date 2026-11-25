const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const verifyToken = require('../middleware/auth');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Protected admin routes
router.post('/', verifyToken, courseController.createCourse);
router.put('/:id', verifyToken, courseController.updateCourse);
router.delete('/:id', verifyToken, courseController.deleteCourse);

module.exports = router;
