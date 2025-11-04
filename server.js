require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Twitter Client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET
});

// Track posted headlines to avoid duplicates
const postedHeadlines = new Set();

// Track topics to cycle through
const topics = ['sports', 'technology', 'entertainment'];
let currentTopicIndex = 0;

let lastGeneratedTweet = '';
let lastGeneratedNews = '';

function isDuplicateHeadline(headline) {
  return postedHeadlines.has(headline);
}

function storeHeadline(headline) {
  postedHeadlines.add(headline);
  if (postedHeadlines.size > 50) {
    // Limit memory usage by removing the oldest headline
    const first = postedHeadlines.values().next().value;
    postedHeadlines.delete(first);
  }
}

// Get trending news from GNews
async function getTrendingNews() {
  const topic = topics[currentTopicIndex];
  currentTopicIndex = (currentTopicIndex + 1) % topics.length;

  try {
    const res = await axios.get(`https://gnews.io/api/v4/top-headlines?lang=en&country=in&topic=${topic}&max=1&apikey=${process.env.GNEWS_API_KEY}`);
    const article = res.data.articles?.[0];
    if (!article) return null;
    return `${article.title} - ${article.description}`;
  } catch (err) {
    console.error("📰 GNews error:", err.response?.data || err.message);
    return null;
  }
}

// Use Gemini to convert news into tweet
async function generateTweetFromNews(newsText) {
  try {
    const prompt = `Convert this sports news headline into a viral, witty tweet for Indian audiences. Keep it under 280 characters:\n"${newsText}"`;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return res.data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (err) {
    console.error("🤖 Gemini error:", err.response?.data || err.message);
    return null;
  }
}

// Main logic to generate tweet and post
async function generateAndOptionallyTweet() {
  const news = await getTrendingNews();
  if (!news) {
    console.log("No trending news found.");
    return;
  }

  if (isDuplicateHeadline(news)) {
    console.log("⚠️ Duplicate headline, skipping...");
    return;
  }

  storeHeadline(news);

  const tweet = await generateTweetFromNews(news);
  if (!tweet) {
    console.log("Failed to generate tweet.");
    return;
  }
  lastGeneratedTweet = tweet;
  lastGeneratedNews = news
console.log(`📝 [${new Date().toLocaleString()}] Generated Tweet:\n${tweet}`);

  try {
    const { data } = await twitterClient.v2.tweet(tweet);
    console.log("✅ Tweet posted:", data);
  } catch (err) {
    console.error("❌ Failed to post tweet:", err.response?.data || err.message);
  }
}

// Run every 100 minute, u can change the time
setInterval(generateAndOptionallyTweet, 100 * 60 * 1000); // every 100 minutes ✅

// Root route
app.get('/', (req, res) => {
res.send(`
    <h2>🚀 Auto Tweet Bot is Running</h2>
    <p><strong>Last generated tweet:</strong></p>
    <blockquote>${lastGeneratedTweet}</blockquote>
    <p>${lastGeneratedNews}</p>`
  );
});

// Generate tweet manually, when u visit this url bot imidiate generate tweet and post without waiting for time
app.get('/generate-now', async (req, res) => {
  await generateAndOptionallyTweet();
  res.send("✅ Tweet generated manually.");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server started at http://localhost:${PORT}`);
});

