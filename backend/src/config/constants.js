const ROLES = Object.freeze({ ADMIN: 'admin', TEACHER: 'teacher', STUDENT: 'student' });
const ROLE_LIST = Object.values(ROLES);

const USER_STATUS = Object.freeze({ ACTIVE: 'active', PENDING: 'pending', DISABLED: 'disabled' });
const USER_STATUS_LIST = Object.values(USER_STATUS);

const STUDENT_STATUS = Object.freeze({ ACTIVE: 'active', INACTIVE: 'inactive', GRADUATED: 'graduated' });
const STUDENT_STATUS_LIST = Object.values(STUDENT_STATUS);

const GENDERS = ['male', 'female', 'other'];

const AUDIENCES = ['all', 'students', 'teachers'];
const ATTENDANCE_STATUS = ['present', 'absent', 'late'];
const SUBMISSION_STATUS = ['submitted', 'checked'];
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

module.exports = {
  ROLES, ROLE_LIST, USER_STATUS, USER_STATUS_LIST, STUDENT_STATUS, STUDENT_STATUS_LIST, GENDERS,
  AUDIENCES, ATTENDANCE_STATUS, SUBMISSION_STATUS, DAYS,
};
