const { Schema, model } = require('mongoose');
const { AUDIENCES } = require('../../config/constants');

const announcementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    audience: { type: String, enum: AUDIENCES, default: 'all' },
    course: { type: String, trim: true }, // optional: only students of this course
    pinned: { type: Boolean, default: false },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false }
);

announcementSchema.index({ pinned: -1, createdAt: -1 });

module.exports = { Announcement: model('Announcement', announcementSchema) };
