const { Schema, model } = require('mongoose');

const GENDERS = ['male', 'female', 'other'];
const STATUSES = ['active', 'inactive', 'graduated'];

const studentSchema = new Schema(
  {
    rollNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: GENDERS },
    course: { type: String, required: true, trim: true },
    year: { type: Number, min: 1, max: 6 },
    address: { type: String, trim: true },
    status: { type: String, enum: STATUSES, default: 'active' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.index({ firstName: 'text', lastName: 'text', email: 'text', course: 'text' });

const Student = model('Student', studentSchema);

module.exports = { Student, GENDERS, STATUSES };
