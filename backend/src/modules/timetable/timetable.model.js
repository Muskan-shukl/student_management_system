const { Schema, model } = require('mongoose');
const { DAYS } = require('../../config/constants');

const slotSchema = new Schema(
  {
    course: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1, max: 6 },
    day: { type: String, enum: DAYS, required: true },
    startTime: { type: String, required: true }, // HH:MM
    endTime: { type: String, required: true },
    subject: { type: String, required: true, trim: true, maxlength: 60 },
    room: { type: String, trim: true, maxlength: 40 },
    teacher: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, versionKey: false }
);

slotSchema.index({ course: 1, year: 1, day: 1, startTime: 1 });

module.exports = { TimetableSlot: model('TimetableSlot', slotSchema) };
