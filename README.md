# HireMind OS 🚀

**HireMind OS** is a unified, intelligent, and hyper-personalized Interview Operating System. It deeply analyzes a candidate's resume and job description to provide a tailored, dynamic interview preparation experience spanning adaptive mock interviews, voice conversations, and real-time multi-agent panel evaluations.
# Live demo link ( google drive ): [https://drive.google.com/file/d/1IhTxl7-yheA3rEouS6-qGAALvsUi7G8U/view?usp=sharing]
## 🌟 Key Features

* **Live Demo**: [https://personalised-ai-interview.vercel.app/](https://personalised-ai-interview.vercel.app/)
* **Intelligent Candidate Profile**: A unified backend system built on MongoDB that tracks your resume data, identified skill gaps, and historical performance to provide a personalized "Readiness Score."
* **Adaptive Difficulty Engine**: In the Live Interview Room, the AI dynamically adjusts the difficulty of subsequent questions based on your performance in real-time.
* **Context-Aware Voice Interviews**: Practice with "Sage", an AI voice interviewer that leverages native browser Speech Recognition to transcribe your answers and intelligently refers to your actual past projects and target roles.
* **Simulated Panel Interview**: Experience a multi-agent interview scenario where a Tech Lead, an Engineering Manager, and an HR Recruiter simultaneously grade your answers from different perspectives.
* **Dynamic Analytics Dashboard**: Track your 8-week performance trend, skill development progress, and hiring confidence predictions based on real data from your practice sessions.

## 🛠️ Technology Stack

* **Frontend**: React, TypeScript, Vite, TailwindCSS, TanStack Router, Recharts, Shadcn UI
* **Backend**: Node.js, Express, MongoDB (Mongoose), Groq AI SDK
* **AI Engine**: Llama-3 (70B Versatile) via Groq API for ultra-fast, high-quality interview generations and grading.
* **Storage**: In-memory MongoDB fallback or standard MongoDB URI via environment variables.

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* A Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Snigdha-0210/Personalised_AI_Interview.git
   cd Personalised_AI_Interview
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the `server` directory and add your Groq API key:
   ```env
   PORT=3001
   GROQ_API_KEY=your_api_key_here
   # Optional: Add your MongoDB URI. If omitted, it will run an in-memory database.
   # MONGODB_URI=mongodb+srv://...
   ```

5. **Run the Application:**
   Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
   Start the frontend development server (in a separate terminal):
   ```bash
   npm run dev
   ```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
