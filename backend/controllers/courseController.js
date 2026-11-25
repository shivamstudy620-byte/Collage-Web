const Course = require('../models/Course');
const { isValidResourceId, findByIdOrLegacy, ensureDbConnected } = require('../utils/dbHelpers');

const getAllCourses = async (req, res) => {
  if (!ensureDbConnected(res)) return;
  try {
    const courses = await Course.find().sort({ sqlite_id: 1, created_at: 1 });
    return res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err.message);
    return res.status(500).json({ message: 'Failed to fetch courses.' });
  }
};

const getCourseById = async (req, res) => {
  const { id } = req.params;
  if (!isValidResourceId(id)) {
    return res.status(400).json({ message: 'Invalid course ID format.' });
  }
  if (!ensureDbConnected(res)) return;

  try {
    const course = await findByIdOrLegacy(Course, id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }
    return res.json(course);
  } catch (err) {
    console.error('Error fetching course:', err.message);
    return res.status(500).json({ message: 'Error fetching course details.' });
  }
};

const createCourse = async (req, res) => {
  const { name, duration, eligibility, description } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Course name is required.' });
  }
  if (duration !== undefined && typeof duration !== 'string') {
    return res.status(400).json({ message: 'Course duration must be a valid string.' });
  }
  if (eligibility !== undefined && typeof eligibility !== 'string') {
    return res.status(400).json({ message: 'Course eligibility must be a valid string.' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ message: 'Course description must be a valid string.' });
  }
  if (!ensureDbConnected(res)) return;

  try {
    const cleanName = name.trim();
    const existing = await Course.findOne({ name: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (existing) {
      return res.status(409).json({ message: `Course "${cleanName}" already exists.` });
    }

    const course = await Course.create({
      name: cleanName,
      duration: (duration && duration.trim()) ? duration.trim() : '3 Years Degree Course',
      eligibility: eligibility ? eligibility.trim() : '',
      description: description ? description.trim() : ''
    });

    return res.status(201).json({
      message: 'Course created successfully.',
      course
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A course with this name already exists.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error('Error creating course:', err.message);
    return res.status(500).json({ message: 'Failed to create course.' });
  }
};

const updateCourse = async (req, res) => {
  const { id } = req.params;
  if (!isValidResourceId(id)) {
    return res.status(400).json({ message: 'Invalid course ID format.' });
  }

  const { name, duration, eligibility, description } = req.body || {};

  if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
    return res.status(400).json({ message: 'Course name must be a non-empty string.' });
  }
  if (duration !== undefined && typeof duration !== 'string') {
    return res.status(400).json({ message: 'Course duration must be a valid string.' });
  }
  if (eligibility !== undefined && typeof eligibility !== 'string') {
    return res.status(400).json({ message: 'Course eligibility must be a valid string.' });
  }
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ message: 'Course description must be a valid string.' });
  }
  if (!ensureDbConnected(res)) return;

  try {
    const course = await findByIdOrLegacy(Course, id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    if (name !== undefined) {
      const cleanName = name.trim();
      const duplicate = await Course.findOne({
        _id: { $ne: course._id },
        name: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
      });
      if (duplicate) {
        return res.status(409).json({ message: `Course "${cleanName}" already exists.` });
      }
      course.name = cleanName;
    }
    if (duration !== undefined) course.duration = duration.trim() || '3 Years Degree Course';
    if (eligibility !== undefined) course.eligibility = eligibility.trim();
    if (description !== undefined) course.description = description.trim();

    await course.save();

    return res.json({
      message: 'Course updated successfully.',
      course
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A course with this name already exists.' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error('Error updating course:', err.message);
    return res.status(500).json({ message: 'Failed to update course.' });
  }
};

const deleteCourse = async (req, res) => {
  const { id } = req.params;
  if (!isValidResourceId(id)) {
    return res.status(400).json({ message: 'Invalid course ID format.' });
  }
  if (!ensureDbConnected(res)) return;

  try {
    const course = await findByIdOrLegacy(Course, id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found.' });
    }

    await Course.deleteOne({ _id: course._id });
    return res.json({ message: 'Course deleted successfully.' });
  } catch (err) {
    console.error('Error deleting course:', err.message);
    return res.status(500).json({ message: 'Failed to delete course.' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse
};
