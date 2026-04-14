# 🎬 ReelTalk Movie Tracker

A web application that lets users track movies, rate them, write reviews, and enhance them using AI.

---

## 📌 Project Description

ReelTalk is a web application that helps users track movies they want to watch or have already seen. Users can browse a collection of movies, save favorites, mark them as watched, rate them, and write short reviews. ReelTalk also allows filtering by genre or viewing status, helping users organize their personal movie library.

For this assignment, I added an **AI-powered feature** called the **AI Review Enhancer**. This feature lets users take a rough movie review and improve it using AI. It runs locally using Ollama, so no API key is needed. Users can also choose different tones (professional, casual, funny, dramatic), and the AI adjusts the style based on what they pick.

---

## ⚙️ Features

### Core Features
- Browse a collection of movies displayed as cards  
- Save movies to a personal favorites list  
- Mark movies as watched  
- Rate movies with a 1–5 star system  
- Write short reviews for each movie  

### Advanced Features
- Filter movies by genre (Action, Drama, Comedy, etc.)  
- Filter movies by watch status (Watched, Not Watched, Favorites)  
- Stats dashboard  
- Reset filter  

### 🤖 AI Feature (Week 12 Addition)
- **AI Review Enhancer using Ollama**
- Rewrite rough reviews into more polished versions  
- Tone selection: **professional, casual, funny, dramatic**  
- Clear button to reset input/output  
- Error handling if something goes wrong  

---

## 🛠️ Tech Stack

- HTML  
- CSS  
- JavaScript  
- Node.js (backend server)  
- Ollama (local AI model)  
- localStorage  

---

## 🤖 AI Integration

This project uses **Ollama** to run a local AI model (`gemma:2b`).

The AI is used to:
- Improve user-written movie reviews  
- Change the tone/style of the review based on user selection  

This shows how an **LLM API can be connected to a real web app** using a backend.

---

## 🧠 AI Assistance

This project was developed with help from AI tools like Claude and ChatGPT.

AI was used to:
- Help set up API calls  
- Debug issues  
- Connect frontend and backend  
- Improve the feature design  

The AI transcript from my development process is included in the submission.

---

## 🚀 Setup Instructions

1. Install Ollama:  
https://ollama.com/download  

2. Run this in your terminal:
ollama run gemma:2b

3. Open a new terminal and go to your project folder:
cd reeltalk-movie-tracker-main

4. Start the server:
node server.js

5. Open `index.html` in your browser and use the AI Review Enhancer.

---

## ⚠️ Known Limitations

- No user authentication  
- Data is stored locally per browser  
- AI feature only works when Ollama is running  

---

## 📚 What I Learned

Working with AI helped speed up development, especially for generating code and fixing errors. At the same time, I learned that I still needed to understand how APIs work and how the frontend connects to a backend.

I also learned that AI doesn’t always give perfect results right away. I had to adjust my prompts and test different approaches to get better outputs. Using Ollama showed me that I can run AI locally without needing API keys, which made things simpler.

Overall, this project helped me understand APIs, AI integration, and how much testing and research goes into making everything actually work together.
