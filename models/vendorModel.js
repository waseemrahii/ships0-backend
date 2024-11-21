import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema, model } = mongoose;

const vendorSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // Ensures password is not included in queries by default
    shopName: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ['pending', 'active', 'rejected'], default: 'pending' },
    vendorImage: { type: String },
    logo: { type: String },
    banner: { type: String },
    role: { type: String, default: 'vendor' },
  },
  {
    timestamps: true,
  }
);

// // Hash password before saving the vendor
vendorSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare the provided password with the hashed password
vendorSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default model('Vendor', vendorSchema);
