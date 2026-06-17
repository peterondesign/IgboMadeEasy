#!/usr/bin/env node
// Generates Igbo TTS audio for the "Igbo Idioms & Proverbs" lesson
// Run: npm run tts:proverbs-idioms

import fs from "node:fs/promises";
import path from "node:path";

const MODEL = "google/gemini-3.1-flash-tts";
const FEMALE_VOICE = process.env.REPLICATE_TTS_FEMALE_VOICE || "Despina";
const FEMALE_STYLE_PROMPT =
  "Say the following in a Nigerian Igbo accent with a warm, clear female tone. Pronounce each word distinctly.";

const ROOT = process.cwd();
const IGBO_AUDIO_DIR = path.join(ROOT, "assets/audio/sentence_breakdowns_igbo");
const EXAMPLE_AUDIO_DIR = path.join(ROOT, "assets/audio/sentence_breakdowns_examples_igbo");

const IGBO_TARGETS = {
  "proverbs-oil-words": "Ilu bụ mmanụ eji eri okwu",
  "proverbs-kite-eagle": "Egbe bere, ugo bere",
  "proverbs-wash-hands": "Nwata kwocha aka, ọ soro ndị okenye rie nri",
  "proverbs-hands-cooperate": "Aka nri kwoo aka ekpe, aka ekpe akụọ aka nri",
  "proverbs-askquestions": "Onye ajụjụ anaghị efu ụzọ",
  "proverbs-one-tree": "Otu osisi anaghị eme ọhịa",
  "proverbs-serve-king": "Onye fee eze, eze eruo ya",
  "proverbs-hero-known": "A na-amata dike n'ogu",
  "proverbs-actions-good": "E jiri mara onye ọma bụ omume ya",
};

const EXAMPLE_TARGETS = {
  "proverbs-oil-words-example": "Ilu bụ mmanụ eji eri okwu taa",
  "proverbs-kite-eagle-example": "Biko, egbe bere ugo bere",
  "proverbs-wash-hands-example": "Ọ na-eso ndị okenye",
  "proverbs-hands-cooperate-example": "Aka nri na-esiri m ike",
  "proverbs-askquestions-example": "Onye ajụjụ na-achọ amamihe",
  "proverbs-one-tree-example": "Anyị bụ otu osisi n'ọhịa",
  "proverbs-serve-king-example": "Onye fee eze ga-enwe anụrị",
  "proverbs-hero-known-example": "Anyị na-amata dike taa",
  "proverbs-actions-good-example": "Omume ya mara mma",
};

async function main() {
  const apiKey = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Replicate API key. Set REPLICATE_API_TOKEN in your terminal."
    );
  }

  await fs.mkdir(IGBO_AUDIO_DIR, { recursive: true });
  await fs.mkdir(EXAMPLE_AUDIO_DIR, { recursive: true });

  const pendingTargets = [];

  for (const [key, text] of Object.entries(IGBO_TARGETS)) {
    const outputPath = path.join(IGBO_AUDIO_DIR, `${key}.wav`);
    if (await fileExists(outputPath)) {
      console.log(`✓ Already exists: ${key}`);
    } else {
      pendingTargets.push({ key, text, outputPath });
    }
  }

  for (const [key, text] of Object.entries(EXAMPLE_TARGETS)) {
    const outputPath = path.join(EXAMPLE_AUDIO_DIR, `${key}.wav`);
    if (await fileExists(outputPath)) {
      console.log(`✓ Already exists: ${key}`);
    } else {
      pendingTargets.push({ key, text, outputPath });
    }
  }

  const total = Object.keys(IGBO_TARGETS).length + Object.keys(EXAMPLE_TARGETS).length;
  console.log(
    `\nFound ${total} idioms & proverbs audio clips (${pendingTargets.length} to generate, ${total - pendingTargets.length} existing).`
  );

  if (pendingTargets.length === 0) {
    console.log("Nothing to do. All proverbs & idioms audio files already exist.");
    return;
  }

  for (let i = 0; i < pendingTargets.length; i++) {
    const { key, text, outputPath } = pendingTargets[i];
    console.log(`\n[${i + 1}/${pendingTargets.length}] ${key}: "${text}"`);
    const outputUrl = await runPrediction(apiKey, { text, key });
    if (!outputUrl) throw new Error(`No output URL returned for: ${key}`);
    await writeAudio(outputUrl, outputPath);
    console.log(`✓ Saved: ${outputPath}`);
  }

  console.log("\n✓ All idioms & proverbs audio files generated successfully.");
}

async function fileExists(filePath) {
  try { await fs.access(filePath); return true; } catch { return false; }
}

async function runPrediction(apiKey, target) {
  const response = await fetch(
    `https://api.replicate.com/v1/models/${MODEL}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "wait=60",
      },
      body: JSON.stringify({
        input: {
          text: target.text,
          voice: FEMALE_VOICE,
          prompt: FEMALE_STYLE_PROMPT,
          language_code: "en-US",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await safeJson(response);
    throw new Error(`Replicate failed (${response.status}): ${JSON.stringify(errorBody)}`);
  }

  let prediction = await response.json();

  while (prediction.status !== "succeeded") {
    if (prediction.status === "failed" || prediction.status === "canceled") {
      throw new Error(`Prediction ${prediction.id} ended: ${prediction.status}`);
    }
    if (!prediction.urls?.get) throw new Error(`No polling URL for ${target.key}`);
    const poll = await fetch(prediction.urls.get, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!poll.ok) throw new Error(`Polling failed (${poll.status})`);
    prediction = await poll.json();
  }

  return extractOutputUrl(prediction.output);
}

function extractOutputUrl(output) {
  if (!output) return null;
  if (typeof output === "string") return output;
  if (Array.isArray(output)) return output.find((i) => typeof i === "string") || null;
  if (typeof output === "object") {
    if (typeof output.audio === "string") return output.audio;
    if (typeof output.url === "string") return output.url;
    return Object.values(output).find((v) => typeof v === "string") || null;
  }
  return null;
}

async function safeJson(response) {
  try { return await response.json(); } catch { return { body: await response.text() }; }
}

async function writeAudio(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch audio: ${response.status}`);
  const buffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(buffer));
}

main().catch((error) => {
  console.error("\n✗ Error:", error.message);
  process.exit(1);
});
