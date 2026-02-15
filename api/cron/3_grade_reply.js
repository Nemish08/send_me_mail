import { AI } from '../../src/utils/ai.js';
import { sendEmail, checkInboxForReply } from '../../src/utils/email.js';
import { Memory } from '../../src/utils/memory.js';

export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const subjectToMatch = `Daily Quiz Challenge [${today}]`;

    // 1. Check Gmail for UNSEEN replies with today's subject
    const replyText = await checkInboxForReply(subjectToMatch);

    if (!replyText) {
      // No new replies, just exit
      return res.status(200).json({ message: "No new replies." });
    }

    console.log("Found reply:", replyText);

    // 2. Get the Correct Answers from Memory
    const data = await Memory.getDailyState(today);
    if (!data || !data.quizData) {
      return res.status(500).json({ error: "Context lost: No quiz data in memory." });
    }

    // 3. AI Grading
    const result = await AI.gradeReply(replyText, data.quizData);

    // 4. Send Report Card
    await sendEmail(`📝 Your Report Card [${today}]`, result.report_card_html);

    // 5. Update Memory (Optional: Prevent re-grading if you implement advanced logic)
    await Memory.updateState(today, { graded: true, score: result.score });

    res.status(200).json({ success: true, message: "Graded successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}