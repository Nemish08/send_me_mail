import axios from 'axios';
import { AI } from '../../src/utils/ai.js';
import { sendEmail } from '../../src/utils/email.js';
import { Memory } from '../../src/utils/memory.js';

export default async function handler(req, res) {
  try {
    console.log("Starting Morning Routine...");
    const today = new Date().toISOString().split('T')[0];

    // 1. Fetch Raw Tech News (Using HackerNews API as a reliable source)
    // We fetch top stories to give the LLM context
    const hnIds = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json');
    const top10Ids = hnIds.data.slice(0, 10);
    const storyPromises = top10Ids.map(id => axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`));
    const stories = await Promise.all(storyPromises);
    const headlines = stories.map(s => s.data.title).join("\n");

    // 2. Generate Content via AI
    const content = await AI.generateNewsAndQuiz(headlines);

    // 3. Send the News Email
    await sendEmail(`📰 Tech Deep Dive: ${today}`, content.email_html);

    // 4. Save State to Vercel KV (Memory) for the afternoon
    // We store the quiz data here to retrieve it at 2 PM
    await Memory.saveDailyState(today, {
      quizData: content.quiz_data,
      quizSent: false,
      graded: false
    });

    res.status(200).json({ success: true, message: "News sent, Quiz stored." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}