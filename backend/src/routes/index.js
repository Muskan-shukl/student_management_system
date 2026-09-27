const { Router } = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const studentRoutes = require('../modules/students/student.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');
const announcementRoutes = require('../modules/announcements/announcement.routes');
const assignmentRoutes = require('../modules/assignments/assignment.routes');
const attendanceRoutes = require('../modules/attendance/attendance.routes');
const timetableRoutes = require('../modules/timetable/timetable.routes');

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'OK', uptime: process.uptime() }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/announcements', announcementRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/timetable', timetableRoutes);

module.exports = router;
