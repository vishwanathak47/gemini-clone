import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { Chat, User } from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Auth Routes ---

app.post('/api/login', async (req, res) => {
  try {
    const { name } = req.body;
    const id = name.toLowerCase().replace(/\s+/g, '-');
    let user = await User.findOne({ id });
    
    if (!user) {
      user = await User.create({
        id,
        name,
        avatar: `https://ui-avatars.com/api/?name=${name}&background=random`
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Chat Routes ---

app.get('/api/chats', async (req, res) => {
  try {
    const { userId } = req.query;
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/chats/:id', async (req, res) => {
  try {
    const chat = await Chat.findOne({ id: req.params.id });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/chats', async (req, res) => {
  try {
    const { id, userId, title, messages, createdAt, updatedAt } = req.body;
    const chat = await Chat.findOneAndUpdate(
      { id },
      { userId, title, messages, createdAt, updatedAt },
      { upsert: true, new: true }
    );
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/chats/:id', async (req, res) => {
  try {
    await Chat.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Gemini Streaming Endpoint ---

app.post('/api/generate', async (req, res) => {
  try {
    const { history, message } = req.body;

    // Convert frontend history format to Gemini SDK format
    // Filter out empty messages or invalid roles if necessary
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const systemInstruction = `You are a helpful, knowledgeable, and creative AI assistant. 
    Your interface is a clone of the Gemini UI, so act the part: be concise, use formatting effectively (Markdown), 
    and offer helpful suggestions. When answering coding questions, provide clear explanations.`;

    // Initialize chat with history
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history: formattedHistory,
      config: { systemInstruction }
    });

    // Stream the response
    const resultStream = await chat.sendMessageStream({ message });
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    for await (const chunk of resultStream) {
      const text = chunk.text;
      if (text) {
        res.write(text);
      }
    }
    res.end();

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
