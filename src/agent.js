// src/agent.js
import { Agent, run, tool } from "@openai/agents";
import 'dotenv/config';
import { z } from "zod";
import axios from "axios";
import nodemailer from "nodemailer";

const outputFormate = z.object({
  city : z.string().describe("name of the city"),
  temp : z.number().describe("temperature of city in celcious"),
  condition : z.string().optional().describe("condition of weather")
});

// weather tool
const weather = tool({
  name: "get_weather",
  description: "returns the current weather of given city",
  parameters: z.object({
    city : z.string().describe("name of the city"),
  }),
  execute: async function ({ city }) {
    const url = `https://wttr.in/${encodeURIComponent(city.toLowerCase())}?format=%C+%t`;
    const response = await axios.get(url, { responseType: "text" });
    return `The weather of ${city} is ${response.data}`;
  }
});

// mail tool
const mail = tool({
  name: "mail_service",
  description: "send the mail to user.",
  parameters: z.object({
    subject: z.string().describe("subject of mail"),
    content: z.string().describe("content of mail that should be in single string in html formated")
  }),
  execute: async function ({ content, subject }) {
    const senderEmail = process.env.EMAIL_SEN;
    const appPassword = process.env.EMAIL_PASS;
    const receiverEmail = process.env.EMAIL_REC;

    if (!senderEmail || !appPassword || !receiverEmail) {
      throw new Error("Missing email environment variables");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: appPassword
      }
    });

    const mailOptions = {
      from: senderEmail,
      to: receiverEmail,
      subject,
      html: content
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Mail sent:", info.messageId);
    return info;
  }
});

// child agent (weather expert)
const weatherAgent = new Agent({
  name: "Weather expert",
  instructions: "You are expert in weather knowledge and you give the user query's answer about weather",
  tools: [weather],
  outputType: outputFormate
});

// main (master) agent
const MainAgent = new Agent({
  name: "Master",
  instructions: "You are main agent and you handle the user query and decide which tool to call.",
  tools: [
    weatherAgent.asTool({
      name: "weather_expert",
      description: "handle all queries related to weather"
    }),
    mail
  ]
});

// function to run agent prompt and send mail (exposed)
export async function generateAndSend(promptText) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment");
  }

  // run the master agent with user prompt
  const result = await run(MainAgent, promptText);

  // finalOutput may be an object/string depending on the agent.
  const finalMessage = result.finalOutput;

  return { success: true, message: 'Email sent', finalMessage };
}

// standalone run (optional)
if (process.argv[2] === "--run") {
  (async () => {
    try {
      await generateAndSend("Send me a mail of complete details 2020 all the important events that happened in India.");
      console.log("Done");
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
