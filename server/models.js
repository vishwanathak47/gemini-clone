import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: String,
  role: { type: String, enum: ['user', 'model'] },
  content: String,
  timestamp: Number
});

const chatSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  userId: String,
  title: String,
  messages: [messageSchema],
  createdAt: Number,
  updatedAt: Number
});

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: String,
  avatar: String
});

export const Chat = mongoose.model('Chat', chatSchema);
export const User = mongoose.model('User', userSchema);
