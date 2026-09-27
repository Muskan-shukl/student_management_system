const { TimetableSlot } = require('./timetable.model');
const { Student } = require('../students/student.model');
const ApiError = require('../../utils/ApiError');
const { DAYS } = require('../../config/constants');

const POPULATE = { path: 'teacher', select: 'name' };
const DAY_ORDER = Object.fromEntries(DAYS.map((d, i) => [d, i]));
const sortSlots = (slots) => slots.sort((a, b) => DAY_ORDER[a.day] - DAY_ORDER[b.day] || a.startTime.localeCompare(b.startTime));

const todayKey = () => DAYS[(new Date().getDay() + 6) % 7]; // JS: 0 = Sunday → 'sun' is index 6

const clean = (payload) => ({ ...payload, room: payload.room || undefined, teacher: payload.teacher || undefined });

const list = async (query) => sortSlots(await TimetableSlot.find(query).populate(POPULATE));

const mine = async (user) => {
  const student = await Student.findOne({ user: user._id }).select('course year');
  if (!student) throw ApiError.notFound('Student profile not found');
  return { course: student.course, year: student.year, today: todayKey(), slots: await list({ course: student.course, year: student.year }) };
};

const today = async (filter) => (await list({ ...filter, day: todayKey() }));

/** Rejects a slot that would double-book the same teacher on the same day at an overlapping time. */
const assertNoTeacherConflict = async (payload, excludeId) => {
  if (!payload.teacher) return;
  const clash = await TimetableSlot.findOne({
    _id: { $ne: excludeId },
    teacher: payload.teacher,
    day: payload.day,
    startTime: { $lt: payload.endTime },
    endTime: { $gt: payload.startTime },
  }).populate(POPULATE);
  if (clash) {
    throw ApiError.badRequest(
      `${clash.teacher?.name ?? 'This teacher'} already has ${clash.subject} on ${clash.day} ${clash.startTime}–${clash.endTime}`,
      [{ field: 'teacher', message: 'Teacher already has a class at this time' }]
    );
  }
};

const create = async (payload) => {
  const data = clean(payload);
  if (data.endTime <= data.startTime) throw ApiError.badRequest('End time must be after start time', [{ field: 'endTime', message: 'Must be after start time' }]);
  await assertNoTeacherConflict(data);
  return (await TimetableSlot.create(data)).populate(POPULATE);
};

const update = async (id, payload) => {
  const slot = await TimetableSlot.findById(id);
  if (!slot) throw ApiError.notFound('Slot not found');
  Object.assign(slot, clean(payload));
  if (slot.endTime <= slot.startTime) throw ApiError.badRequest('End time must be after start time', [{ field: 'endTime', message: 'Must be after start time' }]);
  await assertNoTeacherConflict(slot, id);
  await slot.save();
  return slot.populate(POPULATE);
};

const remove = async (id) => {
  const slot = await TimetableSlot.findByIdAndDelete(id);
  if (!slot) throw ApiError.notFound('Slot not found');
};

const courses = () => Student.distinct('course');

module.exports = { list, mine, today, create, update, remove, courses, todayKey };
