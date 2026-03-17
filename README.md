


````md
# 🚀 Critic — AI-Powered Landing Page Auditor

**Critic** is a high-performance, full-stack application designed to transform landing pages into conversion machines.
By combining intelligent web scraping with the **Llama 3.3 70B model (via Groq)**, Critic performs *"brutally honest"*
audits across UX, copywriting, SEO, performance, and accessibility to show exactly what is costing you conversions.

---

## 🚀 Key Features

### ⚡ Instant AI Audits
- Extracts live data including:
  - Headings
  - CTAs
  - Forms
  - Meta tags  
- Generates a detailed audit report in seconds.

### 📊 Comprehensive Scoring
- Overall score: **0–100**
- Category-wise grading:
  - UX
  - Copywriting
  - Conversion
  - SEO
  - Performance
  - Accessibility

### 🎯 Conversion Intelligence

#### CTA Optimization
Rewrites existing buttons using psychological principles.

#### A/B Test Hypotheses
AI-generated experiments with expected conversion lifts.

#### Copywriting Rewrites
Outcome-driven improvements for:
- Headlines  
- Value propositions  

### 🧠 Audit History & Comparison
- Store past audits  
- Compare two landing pages side-by-side  
- Track improvements or analyze competitors  

### 🎨 Adaptive UI
- Sleek dashboard  
- Full **Dark Mode & Light Mode** support  

### 🔐 Secure Workspace
- JWT-based authentication  
- Private audit history per user  

---

## 🛠 Tech Stack

### 🎨 Frontend
- **Vue.js 3 (Composition API)** — Reactive UI architecture  
- **Vite** — Lightning-fast build tool  
- **Vue Router** — SPA navigation  
- **CSS Variables** — Dynamic theming system  

### ⚙️ Backend
- **Node.js & Express** — REST API  
- **Cheerio** — Server-side HTML scraping  
- **Groq Cloud (Llama 3.3)** — AI analysis engine  
- **MongoDB & Mongoose** — Database & ODM  
- **JWT & BcryptJS** — Authentication & security  

---

## 📦 Installation & Setup

### ✅ Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- Groq API Key

---

## 🔧 Backend Setup

```bash
cd app/backend
npm install
````

Create a `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_api_key
CLIENT_ORIGIN=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

---

## 💻 Frontend Setup

```bash
cd app/frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend server:

```bash
npm run dev
```

---

## 📂 Project Structure

### 📦 Backend

```
/controllers   → AI analysis, auth, audit logic
/models        → Mongoose schemas (User, Audit)
/middleware    → Auth & rate limiting
/routes        → API endpoints
```

### 🎨 Frontend

```
/src/views         → Dashboard, Audit, Compare, Insights, History
/src/composables   → Reusable logic (e.g., useAuth.js)
/src/auditStore.js → Centralized state management
/src/assets        → Styles & themes
```

---

## 🛡 Security & Rate Limiting

To protect against API abuse and manage costs:

### 🔐 JWT Protection

* Audit data is isolated per user

### 🚫 Auth Limiter

* 20 requests per 15 minutes

### ⚡ Analyze Limiter

* 10 AI audits per minute

---

## 💡 Vision

Critic is built to help founders, marketers, and developers make **data-driven decisions** and turn underperforming landing pages into **high-converting assets**.

---


## 📄 License

MIT License © 2026

```
