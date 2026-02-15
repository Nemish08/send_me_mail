import OpenAI from 'openai';
import { config } from '../config.js';

const openai = new OpenAI({ apiKey: config.openaiApiKey });

/**
 * Helper function to call OpenAI with JSON enforcement.
 * switched to "gpt-4o-mini" for speed (5-10s execution) to prevent Vercel timeouts.
 */
async function generateJSON(prompt) {
  try {
    console.log("🤖 Sending request to OpenAI (gpt-4o-mini)...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // FAST MODEL
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that outputs strict JSON only." 
        }, 
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("OpenAI returned empty content.");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("❌ OpenAI Error:", error);
    // Throwing error allows the API route to catch it and send a 500 response
    throw error; 
  }
}

export const AI = {
  /**
   * 1. Generate Technical News & Quiz
   * Takes raw headlines and turns them into a Matrix-style HTML email + JSON Quiz data.
   */
  async generateNewsAndQuiz(rawHeadlines) {
    const prompt = `
      You are a Senior Principal Engineer at a top tech company.
      
      INPUT CONTEXT (Raw Headlines):
      ${rawHeadlines.substring(0, 2500)}

      TASK 1: Create a "Daily Tech Deep Dive" Email (HTML format).
      - Style: Cyberpunk/Matrix aesthetic (Black background #1e1e1e, Neon Green text #00ff00).
      - CSS: Must be INLINE styles (Gmail compatibility).
      - Content: Pick the 3 most technical/interesting stories from the input. Explain the *engineering* impact (Architecture, Database, AI Models, Security). Avoid generic news fluff.
      - Structure: 
        1. <h1> Title with date
        2. <hr>
        3. Story 1 (Title + Technical Analysis)
        4. Story 2 ...
        5. Story 3 ...
        6. Footer: "Stay eager. Stay technical."

      TASK 2: Generate 5 Hard Multiple Choice Questions (MCQs).
      - Based strictly on the stories you analyzed.
      - Questions should test comprehension of the technical details.
      
      REQUIRED OUTPUT JSON FORMAT:
      {
        "email_html": "<body style='background-color:#1e1e1e; color:#00ff00; font-family:monospace; padding:20px;'> ... content ... </body>",
        "quiz_data": [
          { 
            "id": 1, 
            "question": "Regarding the update to [Topic], what mechanism changed?", 
            "options": ["A) Vector embeddings", "B) SQL sharding", "C) Garbage collection", "D) Mutex locks"], 
            "correct_answer": "A" 
          }
        ]
      }
    `;
    return await generateJSON(prompt);
  },

  /**
   * 2. Grade the user's reply
   * Compares user email reply text against the stored correct answers.
   */
  async gradeReply(userReplyText, correctQuizData) {
    const prompt = `
      You are a strict Computer Science Professor.
      
      OFFICIAL QUIZ DATA: 
      ${JSON.stringify(correctQuizData)}
      
      STUDENT REPLY TEXT: 
      "${userReplyText}"
      
      TASK:
      1. Extract the student's answers from their text (they might say "1. A" or "1 is A" or just "A, B, C...").
      2. Compare with official correct_answer.
      3. Calculate a Score (e.g., "3/5").
      4. Generate a "Report Card" Email (HTML).
         - Style: Dark mode, Monospace font.
         - Show which were correct and which were wrong.
         - For wrong answers, explain the CORRECT technical reason briefly.
      
      REQUIRED OUTPUT JSON FORMAT:
      {
        "report_card_html": "<body style='...'> ... content ... </body>",
        "score": "3/5"
      }
    `;
    return await generateJSON(prompt);
  }
};