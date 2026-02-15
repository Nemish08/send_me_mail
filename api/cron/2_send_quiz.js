import { sendEmail } from '../../src/utils/email.js';
import { Memory } from '../../src/utils/memory.js';
import { config } from '../../src/config.js';

export default async function handler(req, res) {
  // --- SECURITY CHECK ---
  const authHeader = req.headers.authorization;
  const querySecret = req.query.secret;
  
  if (querySecret !== config.cronSecret && authHeader !== `Bearer ${config.cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // ----------------------

  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Retrieve Data from Memory
    const data = await Memory.getDailyState(today);
    
    if (!data || !data.quizData) {
      return res.status(404).json({ error: "No quiz data found for today." });
    }

    // 2. Format Quiz HTML
    const subject = `🧠 Daily Quiz Challenge [${today}]`;
    
    let quizHtml = `
      <body style="background:#1e1e1e; color:#00ff00; font-family: 'Courier New', monospace; padding:20px;">
        <h2>${subject}</h2>
        <p>Reply to this email with your answers (e.g., "1. A, 2. C").</p>
        <hr style="border-color:#00ff00;"/>
    `;

    data.quizData.forEach(q => {
      quizHtml += `
        <div style="margin-bottom:20px; border:1px solid #333; padding:10px;">
          <p><strong>Q${q.id}: ${q.question}</strong></p>
          <ul>
            ${q.options.map(opt => `<li>${opt}</li>`).join('')}
          </ul>
        </div>
      `;
    });
    
    quizHtml += `</body>`;

    // 3. Send Email
    await sendEmail(subject, quizHtml);

    // 4. Update Memory
    await Memory.updateState(today, { quizSent: true });

    res.status(200).json({ success: true, message: "Quiz sent." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}