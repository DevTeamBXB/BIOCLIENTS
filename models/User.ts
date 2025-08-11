// src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';

const roles = ['admin', 'employee', 'client'] as const;

export type RoleType = typeof roles[number];

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: RoleType;
  area?: string;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: roles,
    default: 'client',
  },
  area: {
    type: String,
    default: '',
  },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
