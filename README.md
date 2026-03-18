# 🚀 Critic — AI-Powered Landing Page Auditor

> Turn your landing page into a **conversion machine** with brutally honest AI insights.

**Critic** is a high-performance, full-stack application that analyzes landing pages and reveals exactly what is hurting your conversions.

It combines **intelligent web scraping** with the **Llama 3.3 70B model (via Groq)** to generate deep insights across UX, copywriting, SEO, performance, and accessibility.

---

## ✨ Why Critic?

Most tools give you *data*.
Critic gives you **actionable decisions**.

* ❌ "Your headline is weak"
* ✅ "Here are 3 better headlines that increase conversions"

---

## 🚀 Features

### ⚡ Instant AI Audits

* Extracts real-time page data:

  * Headings
  * CTAs
  * Forms
  * Meta tags
* Generates a **full audit report in seconds**

---

### 📊 Smart Scoring System

* Overall Score: **0 – 100**
* Category-wise breakdown:

  * UX
  * Copywriting
  * Conversion
  * SEO
  * Performance
  * Accessibility

---

### 🎯 Conversion Intelligence

#### 🔘 CTA Optimization

* Rewrites weak CTAs using:

  * Psychology triggers
  * Action-driven language

#### 🧪 A/B Test Suggestions

* AI-generated experiments
* Includes expected conversion uplift

#### ✍️ Copywriting Rewrites

* Improves:

  * Headlines
  * Value propositions
  * Messaging clarity

---

### 🧠 Audit History & Comparison

* Save previous audits
* Compare landing pages side-by-side
* Track improvements over time

---

### 🎨 Modern UI

* Clean dashboard experience
* Supports:

  * 🌙 Dark Mode
  * ☀️ Light Mode

---

### 🔐 Secure Workspace

* JWT Authentication
* User-specific audit history
* Secure API handling

---

## 🛠 Tech Stack

### 🎨 Frontend

* Vue.js 3 (Composition API)
* Vite
* Vue Router
* CSS Variables (Theming)

### ⚙️ Backend

* Node.js + Express
* Cheerio (Web Scraping)
* Groq API (Llama 3.3 70B)
* MongoDB + Mongoose
* JWT + BcryptJS

---

## 📦 Installation & Setup

### ✅ Prerequisites

* Node.js (v18+)
* MongoDB (Local / Atlas)
* Groq API Key

---

### 🔧 Backend Setup

```bash
cd app/backend
npm install
npm run dev
```

---

### 🎨 Frontend Setup

```bash
cd app/frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file in `/backend`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
```



## 🌍 Future Improvements

* 🔍 Competitor analysis mode
* 📈 Conversion tracking dashboard
* 🧠 Multi-model AI comparison
* ⚡ Chrome extension

---

## 👨‍💻 Author

**Vivek Sahu**
Frontend Developer | Vue.js | React.js

---


## 💡 Final Thought

> “Good landing pages inform.
> Great landing pages convert.
> Critic makes yours great.”
