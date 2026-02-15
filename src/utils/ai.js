import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

// Helper for strict JSON output from GPT
async function generateJSON(prompt, model = "gpt-4-turbo") {
  const response = await openai.chat.completions.create({
    model: model,
    messages: [{ role: "system", content: "You are a JSON generator." }, { role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });
  return JSON.parse(response.choices[0].message.content);
}

export const AI = {
  // 1. Generate Technical News
  async generateNewsAndQuiz(rawHeadlines) {
    const prompt = `
      You are a Senior Principal Engineer at Google/OpenAI. 
      Audience: B.Tech CS Graduates (Experts). 
      Context: Here are today's raw headlines: ${rawHeadlines.substring(0, 2000)}

      Task 1: Write a "Daily Tech Deep Dive" email in HTML.
      - Focus on LLM Architecture, CUDA, System Design, Compilers, or Kernel updates.
      - No generic fluff. Use jargon (Quantization, RAG pipelines, Attention Mechanisms).
      - Style: Dark Mode, Matrix/Hacker terminal aesthetic (Black background, Green/Neon text).
      - CSS must be inline.

      Task 2: Create 5 HARD Multiple Choice Questions (MCQs) based on this news.
      - Questions must test deep understanding, not surface level.
      
      Output JSON format:
      {
        "email_html": "<html string...>",
        "quiz_data": [
          { "id": 1, "question": "...", "options": ["A) ...", "B) ..."], "correct_answer": "A" }
        ]
      }
    `;
    return await generateJSON(prompt);
  },

  // 2. Grade the user's reply
  async gradeReply(userReplyText, correctQuizData) {
    const prompt = `
      You are a strict CS Professor.
      
      Official Quiz Data: ${JSON.stringify(correctQuizData)}
      
      Student's Email Reply: "${userReplyText}"
      
      Task:
      1. Parse the student's reply to find their answers.
      2. Compare with official answers.
      3. Generate a "Report Card" email in HTML.
      4. If they got a question wrong, explain the technical root cause deeply.
      5. Give a final score (e.g., 3/5).
      
      Output JSON:
      {
        "report_card_html": "<html string...>",
        "score": "3/5"
      }
    `;
    return await generateJSON(prompt);
  }
};