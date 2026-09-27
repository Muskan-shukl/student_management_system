/**
 * Seeds demo accounts. Safe to re-run: existing emails are skipped.
 *   npm run seed
 */
const { connectDB, disconnectDB } = require('../config/db');
const { User } = require('../modules/users/user.model');
const { Student, generateRollNumber } = require('../modules/students/student.model');
const { ROLES, USER_STATUS } = require('../config/constants');
const { Announcement } = require('../modules/announcements/announcement.model');
const { TimetableSlot } = require('../modules/timetable/timetable.model');
const { Assignment } = require('../modules/assignments/assignment.model');
const { Attendance } = require('../modules/attendance/attendance.model');

const DEMO = {
  admin: { name: 'Muskan Shukla', email: 'admin@sms.dev', password: 'Admin@123', role: ROLES.ADMIN },
  teacher: {
    name: 'Rajat Verma',
    email: 'teacher@sms.dev',
    password: 'Teacher@123',
    role: ROLES.TEACHER,
    department: 'Computer Science',
  },
  student: { name: 'Shivani Gupta', email: 'student@sms.dev', password: 'Student@123', role: ROLES.STUDENT },
};

const EXTRA_STUDENTS = [
  { name: 'Arpita Singh', email: 'arpita@sms.dev', course: 'B.Tech CSE', year: 2 },
  { name: 'Rishu Kumar', email: 'rishu@sms.dev', course: 'B.Tech CSE', year: 3 },
  { name: 'Varun Mehta', email: 'varun@sms.dev', course: 'BCA', year: 1 },
];

const ensureUser = async (data) => {
  const existing = await User.findOne({ email: data.email });
  if (existing) return { user: existing, created: false };
  return { user: await User.create({ ...data, status: USER_STATUS.ACTIVE }), created: true };
};

const ensureStudent = async (userData, profile) => {
  const { user, created } = await ensureUser({ ...userData, password: 'Student@123', role: ROLES.STUDENT });
  if (!(await Student.exists({ user: user._id }))) {
    await Student.create({ ...profile, user: user._id, rollNumber: await generateRollNumber() });
  }
  return created;
};

const daysAgo = (n) => new Date(new Date(Date.now() - n * 86400000).toISOString().slice(0, 10) + 'T00:00:00.000Z');

/** Sample notices, timetable, homework and a fortnight of attendance (only if none exist). */
const seedExtras = async (admin, teacher) => {
  if (!(await Announcement.exists({}))) {
    await Announcement.create([
      { title: 'Welcome to the new semester', body: 'Classes begin Monday. Check your timetable and make sure your contact details are up to date.', audience: 'all', pinned: true, author: admin._id },
      { title: 'Unit test next week', body: 'Data Structures unit test on Friday. Syllabus: arrays, linked lists, stacks and queues.', audience: 'students', course: 'B.Tech CSE', author: teacher._id },
    ]);
  }
  if (!(await TimetableSlot.exists({}))) {
    const mk = (day, startTime, endTime, subject, room) => ({ course: 'B.Tech CSE', year: 2, day, startTime, endTime, subject, room, teacher: teacher._id });
    await TimetableSlot.create([
      mk('mon', '09:00', '10:00', 'Data Structures', 'Lab 2'), mk('mon', '11:00', '12:00', 'Mathematics III', 'B-104'),
      mk('tue', '09:00', '10:00', 'Operating Systems', 'B-201'), mk('tue', '14:00', '15:00', 'Data Structures', 'Lab 2'),
      mk('wed', '10:00', '11:00', 'Mathematics III', 'B-104'), mk('thu', '09:00', '10:00', 'Operating Systems', 'B-201'),
      mk('fri', '11:00', '12:00', 'Data Structures', 'Lab 2'), mk('sat', '09:00', '10:00', 'Mathematics III', 'B-104'),
    ]);
  }
  if (!(await Assignment.exists({}))) {
    await Assignment.create([
      { title: 'Implement a linked list', description: 'Singly linked list with insert, delete and reverse. Submit the source file.', subject: 'Data Structures', dueDate: daysAgo(-5), course: 'B.Tech CSE', teacher: teacher._id },
      { title: 'Process scheduling worksheet', description: 'Solve the FCFS, SJF and Round Robin problems from chapter 5.', subject: 'Operating Systems', dueDate: daysAgo(2), course: 'B.Tech CSE', teacher: teacher._id },
    ]);
  }
  if (!(await Attendance.exists({}))) {
    const students = await Student.find({ assignedTeacher: teacher._id }).select('_id');
    const rows = [];
    for (let d = 1; d <= 14; d++) {
      const date = daysAgo(d);
      if ([0, 6].includes(date.getUTCDay())) continue;
      for (const s of students) rows.push({ student: s._id, date, status: Math.random() < 0.85 ? 'present' : Math.random() < 0.5 ? 'late' : 'absent', markedBy: teacher._id });
    }
    await Attendance.insertMany(rows);
    for (const s of students) {
      const mine = rows.filter((r) => r.student.equals(s._id));
      await Student.updateOne({ _id: s._id }, { attendance: { present: mine.filter((r) => r.status !== 'absent').length, total: mine.length } });
    }
  }
};

const run = async () => {
  await connectDB();

  const { created: adminCreated } = await ensureUser(DEMO.admin);
  // (re-fetched below for extras)
  const { user: teacher, created: teacherCreated } = await ensureUser(DEMO.teacher);

  const studentCreated = await ensureStudent(DEMO.student, {
    course: 'B.Tech CSE',
    year: 2,
    gender: 'female',
    assignedTeacher: teacher._id,
    attendance: { present: 42, total: 48 },
    grades: [
      { subject: 'Data Structures', score: 84, maxScore: 100 },
      { subject: 'Operating Systems', score: 71, maxScore: 100 },
      { subject: 'Mathematics III', score: 92, maxScore: 100 },
    ],
    remarks: 'Consistent performer. Encourage participation in coding contests.',
  });

  const { user: admin } = await ensureUser(DEMO.admin);
  for (const s of EXTRA_STUDENTS) {
    await ensureStudent(
      { name: s.name, email: s.email },
      { course: s.course, year: s.year, assignedTeacher: teacher._id, attendance: { present: 30, total: 40 } }
    );
  }

  await seedExtras(admin, teacher);

  console.log('\nDemo accounts');
  console.table(
    Object.entries(DEMO).map(([role, d]) => ({
      role,
      email: d.email,
      password: d.password,
      state: { admin: adminCreated, teacher: teacherCreated, student: studentCreated }[role] ? 'created' : 'exists',
    }))
  );
  await disconnectDB();
};

run().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await disconnectDB();
  process.exit(1);
});
