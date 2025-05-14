# 🐦 Auto Tweet Bot with Gemini AI

An intelligent Twitter bot that fetches trending news from India using **GNews API**, rewrites it into witty and viral tweets using **Gemini Flash 1.5 API**, and optionally posts them to **Twitter** via the **Twitter API v2**. It automatically runs every minute and avoids duplicate headlines.

---

## 🚀 Features

- 🔁 Cycles through topics: `sports`, `technology`, and `entertainment`
- 🧠 Uses Gemini Flash 1.5 to generate witty tweets under 280 characters
- 📡 Posts tweets automatically via Twitter API (can be toggled)
- ⚠️ Prevents posting duplicate news headlines
- 🌐 Web interface to preview and manually trigger tweet generation
- ☁️ Deployable to Render or any Node.js-compatible platform

---

## 🛠️ Tech Stack

- **Node.js** + **Express**
- **Axios** for API calls
- **Twitter API v2** via `twitter-api-v2` library
- **Gemini Flash 1.5 API** (Google Generative Language API)
- **GNews API** for Indian news
- `.env` for environment variables

---

## 🔧 Setup Instructions

### 1. Clone the Repository


git clone https://github.com/your-username/auto-tweet-bot.git
cd auto-tweet-bot
### 2. Install Dependencies
npm install
### 3. Create .env File
TWITTER_APP_KEY=your-twitter-app-key
TWITTER_APP_SECRET=your-twitter-app-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_SECRET=your-twitter-access-secret

GEMINI_API_KEY=your-gemini-api-key
GNEWS_API_KEY=your-gnews-api-key
💡 Keep .env file secret and never commit it to GitHub.

▶️ Run Locally
node index.js
