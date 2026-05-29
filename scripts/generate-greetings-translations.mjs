import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const greetingsDir = path.join(projectRoot, "assets", "audio", "greetings");
const outputPath = path.join(greetingsDir, "translations.json");

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY is not set.");
  process.exit(1);
}

const files = fs
  .readdirSync(greetingsDir)
  .filter((file) => file.toLowerCase().endsWith(".wav"));

const phrases = files
  .map((file) => path.basename(file, ".wav"))
  .sort((a, b) => a.localeCompare(b));

const existing = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
  : {};

const missing = phrases.filter((phrase) => typeof existing[phrase] !== "string");
if (missing.length === 0) {
  console.log("translations.json already contains all greetings.");
  process.exit(0);
}

const prompt = [
  "Translate each Igbo phrase to natural English.",
  "Return JSON only with this shape:",
  '{"translations": {"Igbo phrase": "English translation"}}',
  "Do not include markdown code fences.",
  "Phrases:",
  ...missing.map((phrase) => `- ${phrase}`),
].join("\n");

const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "gpt-4.1-mini",
    input: prompt,
  }),
});

if (!response.ok) {
  const errorText = await response.text();
  console.error("OpenAI request failed:", errorText);
  process.exit(1);
}

const data = await response.json();
const outputText = data.output_text?.trim();
if (!outputText) {
  console.error("Model returned empty output_text.");
  process.exit(1);
}

let parsed;
try {
  parsed = JSON.parse(outputText);
} catch (error) {
  console.error("Failed to parse model JSON output:", outputText);
  throw error;
}

if (!parsed?.translations || typeof parsed.translations !== "object") {
  console.error("Response JSON missing translations object.");
  process.exit(1);
}

const merged = { ...existing, ...parsed.translations };
const sorted = Object.fromEntries(
  Object.entries(merged).sort(([a], [b]) => a.localeCompare(b))
);

fs.writeFileSync(outputPath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
console.log(`Wrote ${Object.keys(sorted).length} entries to ${outputPath}`);
