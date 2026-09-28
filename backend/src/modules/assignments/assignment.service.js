const { Assignment } = require('./assignment.model');
const { Student } = require('../students/student.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, buildMeta } = require('../../utils/pagination');
const { ROLES } = require('../../config/constants');
const { escapeRegex } = require('../../utils/regex');

const TEACHER_POPULATE = { path: 'teacher', select: 'name' };
const SUB_POPULATE = { path: 'submissions.student', select: 'rollNumber user', populate: { path: 'user', select: 'name' } };

const startOfToday = () => new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z');

/** Case-insensitive exact match for a free-text course string, so "b.tech cse" == "B.Tech CSE". */
const courseExact = (course) => new RegExp(`^${escapeRegex(String(course).trim())}$`, 'i');

/** Assignments that apply to a given student profile. */
const filterForStudent = (student) => ({
  teacher: student.assignedTeacher,
  $or: [{ course: { $in: [null, ''] } }, { course: courseExact(student.course) }],
});

const decorateForStudent = (doc, studentId) => {
  const sub = doc.submissions.find((s) => String(s.student) === String(studentId));
  const status = sub ? sub.status : doc.dueDate < startOfToday() ? 'overdue' : 'pending';
  const { submissions, ...rest } = doc.toObject();
  return { ...rest, mySubmission: sub ?? null, myStatus: status };
};

const decorateForTeacher = (doc, totalStudents) => {
  const submitted = doc.submissions.length;
  const checked = doc.submissions.filter((s) => s.status === 'checked').length;
  return { ...doc.toObject(), stats: { total: totalStudents, submitted, checked, pending: Math.max(0, totalStudents - submitted) } };
};

const list = async (query, actor) => {
  const { page, limit, skip } = getPagination(query);

  if (actor.role === ROLES.STUDENT) {
    const student = await Student.findOne({ user: actor._id }).select('assignedTeacher course');
    if (!student?.assignedTeacher) return { items: [], meta: buildMeta({ page, limit, total: 0 }) };
    const docs = await Assignment.find(filterForStudent(student)).populate(TEACHER_POPULATE).sort({ dueDate: -1 });
    let items = docs.map((d) => decorateForStudent(d, student._id));
    if (query.status) items = items.filter((i) => i.myStatus === query.status);
    return { items: items.slice(skip, skip + limit), meta: buildMeta({ page, limit, total: items.length }) };
  }

  const filter = actor.role === ROLES.TEACHER ? { teacher: actor._id } : {};
  const [docs, total] = await Promise.all([
    Assignment.find(filter).populate(TEACHER_POPULATE).sort({ dueDate: -1 }).skip(skip).limit(limit),
    Assignment.countDocuments(filter),
  ]);
  const counts = await Promise.all(
    docs.map((d) => Student.countDocuments({ assignedTeacher: d.teacher._id, ...(d.course ? { course: courseExact(d.course) } : {}) }))
  );
  return { items: docs.map((d, i) => decorateForTeacher(d, counts[i])), meta: buildMeta({ page, limit, total }) };
};

const getForTeacher = async (id, actor) => {
  const doc = await Assignment.findById(id).populate(TEACHER_POPULATE).populate(SUB_POPULATE);
  if (!doc) throw ApiError.notFound('Assignment not found');
  if (actor.role === ROLES.TEACHER && !doc.teacher._id.equals(actor._id)) throw ApiError.forbidden('Not your assignment');
  const students = await Student.find({ assignedTeacher: doc.teacher._id, ...(doc.course ? { course: courseExact(doc.course) } : {}) })
    .select('rollNumber user').populate({ path: 'user', select: 'name' }).sort({ rollNumber: 1 });
  const subs = new Map(doc.submissions.map((s) => [String(s.student?._id ?? s.student), s]));
  const roster = students.map((s) => {
    const sub = subs.get(String(s._id));
    return { student: { _id: s._id, rollNumber: s.rollNumber, name: s.user.name }, status: sub?.status ?? 'pending', note: sub?.note, submittedAt: sub?.submittedAt, checkedAt: sub?.checkedAt };
  });
  return { ...decorateForTeacher(doc, students.length), roster };
};

const create = async (payload, actor) => {
  const doc = await Assignment.create({ ...payload, course: payload.course || undefined, description: payload.description || undefined, teacher: actor._id });
  return getForTeacher(doc._id, actor);
};

const ownedDoc = async (id, actor) => {
  const doc = await Assignment.findById(id);
  if (!doc) throw ApiError.notFound('Assignment not found');
  if (actor.role === ROLES.TEACHER && !doc.teacher.equals(actor._id)) throw ApiError.forbidden('Not your assignment');
  return doc;
};

const update = async (id, payload, actor) => {
  const doc = await ownedDoc(id, actor);
  if (payload.course === '') payload.course = undefined;
  if (payload.description === '') payload.description = undefined;
  Object.assign(doc, payload);
  await doc.save();
  return getForTeacher(id, actor);
};

const remove = async (id, actor) => {
  const doc = await ownedDoc(id, actor);
  await doc.deleteOne();
};

const submit = async (id, actor, note) => {
  const student = await Student.findOne({ user: actor._id }).select('assignedTeacher course');
  if (!student) throw ApiError.notFound('Student profile not found');
  const doc = await Assignment.findOne({ _id: id, ...filterForStudent(student) });
  if (!doc) throw ApiError.notFound('Assignment not found');

  const existing = doc.submissions.find((s) => s.student.equals(student._id));
  if (existing?.status === 'checked') throw ApiError.badRequest('This submission has already been checked');
  if (existing) {
    existing.note = note || undefined;
    existing.submittedAt = new Date();
  } else {
    doc.submissions.push({ student: student._id, note: note || undefined });
  }
  await doc.save();
  await doc.populate(TEACHER_POPULATE);
  return decorateForStudent(doc, student._id);
};

const review = async (id, studentId, status, actor) => {
  const doc = await ownedDoc(id, actor);
  const sub = doc.submissions.find((s) => s.student.equals(studentId));
  if (!sub) throw ApiError.notFound('This student has not submitted yet');
  sub.status = status;
  sub.checkedAt = status === 'checked' ? new Date() : undefined;
  await doc.save();
  return getForTeacher(id, actor);
};

module.exports = { list, getForTeacher, create, update, remove, submit, review };
