const { Announcement } = require('./announcement.model');
const { Student } = require('../students/student.model');
const ApiError = require('../../utils/ApiError');
const { getPagination, buildMeta } = require('../../utils/pagination');
const { ROLES } = require('../../config/constants');

const POPULATE = { path: 'author', select: 'name role' };

/** What an actor is allowed to see. */
const visibilityFilter = async (actor) => {
  if (actor.role === ROLES.ADMIN) return {};
  if (actor.role === ROLES.TEACHER) return { $or: [{ audience: { $in: ['all', 'teachers'] } }, { author: actor._id }] };
  const student = await Student.findOne({ user: actor._id }).select('course');
  return {
    audience: { $in: ['all', 'students'] },
    $or: [{ course: { $in: [null, ''] } }, { course: student?.course ?? null }],
  };
};

const list = async (query, actor) => {
  const { page, limit, skip } = getPagination(query);
  const filter = await visibilityFilter(actor);
  const [items, total] = await Promise.all([
    Announcement.find(filter).populate(POPULATE).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(limit),
    Announcement.countDocuments(filter),
  ]);
  return { items, meta: buildMeta({ page, limit, total }) };
};

const latest = async (actor, n = 3) => Announcement.find(await visibilityFilter(actor)).populate(POPULATE).sort({ pinned: -1, createdAt: -1 }).limit(n);

const create = async (payload, actor) => {
  if (actor.role === ROLES.TEACHER && payload.audience === 'teachers') {
    throw ApiError.forbidden('Teachers can only post to students or everyone');
  }
  if (actor.role === ROLES.TEACHER) payload.pinned = false;
  const doc = await Announcement.create({ ...payload, course: payload.course || undefined, author: actor._id });
  return doc.populate(POPULATE);
};

const getOwned = async (id, actor) => {
  const doc = await Announcement.findById(id);
  if (!doc) throw ApiError.notFound('Announcement not found');
  if (actor.role !== ROLES.ADMIN && !doc.author.equals(actor._id)) throw ApiError.forbidden('You can only edit your own announcements');
  return doc;
};

const update = async (id, payload, actor) => {
  const doc = await getOwned(id, actor);
  if (actor.role === ROLES.TEACHER) delete payload.pinned;
  if (payload.course === '') payload.course = undefined;
  Object.assign(doc, payload);
  await doc.save();
  return doc.populate(POPULATE);
};

const remove = async (id, actor) => {
  const doc = await getOwned(id, actor);
  await doc.deleteOne();
};

module.exports = { list, latest, create, update, remove };
