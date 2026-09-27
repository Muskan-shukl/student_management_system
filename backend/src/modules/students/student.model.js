const { Schema, model } = require('mongoose');
const { STUDENT_STATUS_LIST, STUDENT_STATUS, GENDERS } = require('../../config/constants');

const gradeSchema = new Schema(
  {
    subject: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0 },
    maxScore: { type: Number, required: true, min: 1, default: 100 },
  },
  { _id: false }
);

const studentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    course: { type: String, required: true, trim: true },
    year: { type: Number, min: 1, max: 6, default: 1 },
    gender: { type: String, enum: GENDERS },
    dateOfBirth: { type: Date },
    address: { type: String, trim: true, maxlength: 255 },
    guardianName: { type: String, trim: true, maxlength: 60 },
    guardianPhone: { type: String, trim: true },
    status: { type: String, enum: STUDENT_STATUS_LIST, default: STUDENT_STATUS.ACTIVE },
    assignedTeacher: { type: Schema.Types.ObjectId, ref: 'User' },
    grades: { type: [gradeSchema], default: [] },
    attendance: {
      present: { type: Number, min: 0, default: 0 },
      total: { type: Number, min: 0, default: 0 },
    },
    remarks: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

studentSchema.virtual('attendancePercent').get(function attendancePercent() {
  const { present = 0, total = 0 } = this.attendance || {};
  return total ? Math.round((present / total) * 100) : null;
});

studentSchema.virtual('averageScore').get(function averageScore() {
  if (!this.grades?.length) return null;
  const pct = this.grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / this.grades.length;
  return Math.round(pct);
});

studentSchema.index({ course: 1, status: 1 });
studentSchema.index({ assignedTeacher: 1 });

const Student = model('Student', studentSchema);

/** Generates a sequential roll number like STU-2026-0042. */
const generateRollNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Student.countDocuments();
  return `STU-${year}-${String(count + 1).padStart(4, '0')}`;
};

const STUDENT_POPULATE = [
  { path: 'user', select: 'name email phone status lastLoginAt' },
  { path: 'assignedTeacher', select: 'name email department' },
];

module.exports = { Student, generateRollNumber, STUDENT_POPULATE };
