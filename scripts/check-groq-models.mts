import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env["GROQ_API_KEY"] });

const models = await groq.models.list();
console.log("Available Groq Models:\n");
models.data
  .filter((m) => m.active)
  .forEach((m) => console.log(`- ${m.id}`));
