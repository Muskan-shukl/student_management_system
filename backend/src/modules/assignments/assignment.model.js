const { Schema, model } = require('mongoose');
const { SUBMISSION_STATUS } = require('../../config/constants');

const submissionSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: SUBMISSION_STATUS, default: 'submitted' },
    note: { type: String, trim: true, maxlength: 500 },
    submittedAt: { type: Date, default: Date.now },
    checkedAt: { type: Date },
  },
  { _id: false }
);

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000 },
    subject: { type: String, required: true, trim: true, maxlength: 60 },
    dueDate: { type: Date, required: true },
    course: { type: String, trim: true }, // optional: only students of this course
    teacher: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submissions: { type: [submissionSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

assignmentSchema.index({ teacher: 1, dueDate: -1 });

module.exports = { Assignment: model('Assignment', assignmentSchema) };
