# 🤖 VITIQ - AI-Powered Chatbot for VIT Bhopal University

VITIQ is an intelligent FAQ chatbot designed to assist students, aspirants, and parents with accurate, fast, and multilingual information about VIT Bhopal University. Powered by LLaMA2 for advanced NLP capabilities and enhanced with fuzzy matching, VITIQ responds to queries using a local knowledge base and can also fetch responses from a language model when necessary.

---

## 🌐 Live Features

- 🧠 **AI-Powered Responses**: Uses fuzzy matching to provide relevant answers from a curated dataset and LLaMA2 for unmatched queries.
- 🗣 **Multilingual Support**: Automatically translates questions and answers based on selected language.
- 📄 **Massive FAQ Dataset**: Covers all key aspects — admission, hostel, courses, placements, clubs, etc.
- 📝 **Inquiry Form**: Collects user inquiries (program, name, phone, email, etc.) and saves them using a Node.js backend with MongoDB.
- 🌙 **Dark Mode** and 💬 **Floating Chat UI** for seamless user experience.

---

## 🚀 How It Works

### Frontend (📁 `index.html`)

- Simple UI for user input.
- Language selection + dark mode.
- Inquiry form submission.
- Translates input/output using [MyMemory API](https://mymemory.translated.net/).

### Backend - Flask (📁 `app.py`)

- Loads a custom FAQ dataset (`dataset.json`).
- Uses `fuzzywuzzy` to find the closest match.
- Falls back to LLaMA2 (via `langchain_community.llms.LlamaCpp`) for open-ended questions.
- `/chat` endpoint handles question-answer flow.


