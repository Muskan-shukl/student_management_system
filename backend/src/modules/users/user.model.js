const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE_LIST, ROLES, USER_STATUS_LIST, USER_STATUS } = require('../../config/constants');

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLE_LIST, default: ROLES.STUDENT },
    status: { type: String, enum: USER_STATUS_LIST, default: USER_STATUS.ACTIVE },
    phone: { type: String, trim: true },
    department: { type: String, trim: true }, // teachers only
    tokenVersion: { type: Number, default: 0 }, // bumped on logout / password change
    passwordReset: {
      tokenHash: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.tokenVersion;
        delete ret.passwordReset;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = model('User', userSchema);

module.exports = { User };
