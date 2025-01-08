import { model, Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    gender: { type: String, enum: ['woman', 'man'], default: 'woman' },
    weight: { type: Number, default: 0 },
    timeActive: { type: Number, default: 0 },
    dailyNorma: { type: Number, default: 2000 },
    avatar: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const UsersCollection = model('users', userSchema);
