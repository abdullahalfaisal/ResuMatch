# 🎯 ResuMatch | AI-Powered ATS Resume Analyzer

![ResuMatch Banner](https://img.shields.io/badge/Powered_by-Google_Gemini-8A2BE2?style=for-the-badge) ![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**ResuMatch** is a blazing-fast, modern web application designed to help job seekers bypass Applicant Tracking Systems (ATS). By instantly comparing a candidate's resume (PDF/DOCX) against a target job description using Google's advanced Gemini AI, ResuMatch provides deep, actionable insights to optimize your application.

---

## ✨ Key Features

- **📄 Universal Document Parsing**: Seamlessly extracts text from both `.pdf` and `.docx` files entirely in the backend using `pdf-parse` and `mammoth`.
- **🧠 Advanced AI Semantic Matching**: Uses Google's `gemini-flash-lite-latest` AI model to deeply understand context, rather than just doing basic keyword matching.
- **📊 Detailed ATS Scoring**: Provides an overall ATS compatibility score, a parsed text readability rate, and a breakdown across Skills, Experience, and Alignment.
- **✅ Actionable Feedback**: Generates a tailored action plan detailing exact missing skills, strengths, and recommendations for improvement.
- **🌗 Stunning UI/UX**: Features a highly responsive, modern interface with smooth micro-animations (Framer Motion), glassmorphism effects, and full Dark Mode support.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & custom CSS variables
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Document Processing**: `pdf-parse`, `mammoth`

---

## 🚀 Getting Started (Local Development)

Follow these steps to run ResuMatch locally on your machine.

### 1. Prerequisites
- Node.js 18+ installed
- A free API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/abdullahalfaisal/ResuMatch.git
cd ResuMatch
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and add your Gemini API key:
```env
GEMINI_API_KEY="your_api_key_here"
```

### 4. Run the Server
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the app in action!

---

## ☁️ Deployment

ResuMatch is optimized for one-click deployment on **Vercel**. 
1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add the `GEMINI_API_KEY` to the Vercel Environment Variables.
4. Click **Deploy**!

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
