const { Schema, model } = require('mongoose');
const { ATTENDANCE_STATUS } = require('../../config/constants');

const attendanceSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, required: true }, // UTC midnight
    status: { type: String, enum: ATTENDANCE_STATUS, required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true, versionKey: false }
);

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

module.exports = { Attendance: model('Attendance', attendanceSchema) };
