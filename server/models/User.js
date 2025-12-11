const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },

    // ⭐ Whether admin has chosen to hide the token panel on dashboard
    hideAdminTokenCard: {
      type: Boolean,
      default: false,
    },

    // ⭐ Generated admin authentication token (persistent)
    generatedAdminToken: {
      type: String,
      default: '',
    },

    // ⭐ Security question based reset
    securityQuestion: { type: String },
    securityAnswer: { type: String }, // will be hashed

    // ⭐ Profile & shipping address
    shippingAddress: {
      fullName: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phone: { type: String },
    },
  },
  { timestamps: true }
);

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Compare entered security answer with hashed one
userSchema.methods.matchSecurityAnswer = async function (enteredAnswer) {
  if (!this.securityAnswer) return false;
  return await bcrypt.compare(enteredAnswer, this.securityAnswer);
};

// Hash password (and securityAnswer) before saving
userSchema.pre('save', async function () {
  // If password not modified (e.g. updating profile), skip hashing
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Hash securityAnswer if modified
  if (this.isModified('securityAnswer') && this.securityAnswer) {
    const salt = await bcrypt.genSalt(10);
    this.securityAnswer = await bcrypt.hash(this.securityAnswer, salt);
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
