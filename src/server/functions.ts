import { createServerFn } from "@tanstack/react-start";
import mongoose from "mongoose";
import Groq from "groq-sdk";

// Initialize AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_key_to_prevent_crash" });

// Database connection logic
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.warn("⚠️ No MONGODB_URI found. Mock fallback will be used.");
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
  } catch (e) {
    console.error("DB connection error:", e);
  }
}

// AI logic
async function generateInterviewQuestions(profileContext: string) {
  if (!process.env.GROQ_API_KEY) throw new Error("No GROQ API Key");
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are an expert technical interviewer. Generate 5 highly relevant interview questions based on the candidate's profile. Return ONLY a JSON array of objects with keys: id, text, type, difficulty, status ('pending')." },
      { role: "user", content: `Context:\n${profileContext}\n\nGenerate exactly 5 questions.` }
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" }
  });
  const jsonContent = completion.choices[0]?.message?.content || '{"questions":[]}';
  const data = JSON.parse(jsonContent);
  return data.questions || data;
}

export const startDefaultInterview = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const questions = await generateInterviewQuestions("Target Role: General Software Engineer. Generate general computer science questions.");
      return { success: true, data: questions };
    } catch (e) {
      return {
        success: true,
        data: [
          { id: "1", text: "Explain the difference between a process and a thread.", type: "Technical", difficulty: "Medium", status: "pending" },
          { id: "2", text: "Describe a time you had to deal with a difficult bug. How did you resolve it?", type: "Behavioral", difficulty: "Easy", status: "pending" },
          { id: "3", text: "How would you design a scalable URL shortener like bit.ly?", type: "System Design", difficulty: "Hard", status: "pending" },
          { id: "4", text: "What are the core principles of object-oriented programming?", type: "Technical", difficulty: "Medium", status: "pending" },
          { id: "5", text: "Explain the concept of 'closure' in JavaScript.", type: "Language Specific", difficulty: "Medium", status: "pending" }
        ]
      };
    }
  });

export const panelGradeDefault = createServerFn({ method: "POST" })
  .validator((data: { answer: string; question: string }) => data)
  .handler(async ({ data }) => {
    try {
      if (!process.env.GROQ_API_KEY) throw new Error("No AI Key");
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are an AI interview panel consisting of 3 personas: Technical (role: 'Technical Expert'), Product (role: 'Product Manager'), and Culture (role: 'Culture Lead'). Evaluate the candidate's answer. Return ONLY JSON: { \"evaluations\": [ { \"role\": \"Technical Expert\", \"score\": 85, \"feedback\": \"Good...\" }, ... ] }" },
          { role: "user", content: `Question: ${data.question || 'General check'}\nAnswer: ${data.answer}` }
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });
      return { success: true, data: JSON.parse(completion.choices[0]?.message?.content || '{"evaluations":[]}') };
    } catch (e) {
      return {
        success: true,
        data: {
          evaluations: [
            { role: "Technical Expert", score: 85, feedback: "Solid technical foundations." },
            { role: "Product Manager", score: 75, feedback: "Good, but think about user impact more." },
            { role: "Culture Lead", score: 90, feedback: "Great communication!" }
          ]
        }
      };
    }
  });
