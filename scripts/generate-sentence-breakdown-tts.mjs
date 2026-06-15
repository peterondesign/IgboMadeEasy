#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const MODEL = "google/gemini-3.1-flash-tts";
const FEMALE_VOICE = process.env.REPLICATE_TTS_FEMALE_VOICE || "Despina";
const FEMALE_STYLE_PROMPT =
  "Say the following in a Nigerian Igbo accent with a warm, clear female tone.";

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, "assets/audio/sentence_breakdowns");

// Sentence breakdown targets - map of audio key to English sentence
const TARGETS = {
  // Introduction to Igbo (10)
  "what-is-your-name": "What is your name?",
  "how-are-you": "How are you?",
  "i-want-to-go-home": "I want to go home.",
  "i-do-not-understand": "I do not understand.",
  "i-am-hungry": "I am hungry.",
  "i-have-two-brothers": "I have two brothers.",
  "i-will-come-tomorrow": "I will come tomorrow.",
  "where-is-our-sister": "Where is our sister?",
  "they-are-tired": "They are tired.",
  "we-are-thirsty": "We are thirsty.",
  
  // Getting Started (11)
  "give-him-water": "Give him water.",
  "he-is-going-to-the-river-to-fetch-water": "He is going to the river to fetch water.",
  "i-am-going-to-see-my-father-at-the-farm": "I am going to see my father at the farm.",
  "if-it-rains-we-will-stay-at-home": "If it rains, we will stay at home.",
  "my-house-is-bigger-than-your-house": "My house is bigger than your house.",
  "shall-we-go-see-them": "Shall we go see them?",
  "the-boy-who-is-playing-football-is-my-friend": "The boy who is playing football is my friend.",
  "they-are-playing-football-near-the-school": "They are playing football near the school.",
  "they-walked-a-long-distance-this-morning": "They walked a long distance this morning.",
  "we-can-go-tomorrow": "We can go tomorrow.",
  "we-cannot-go-home": "We cannot go home.",
};

async function main() {
  const apiKey = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Replicate API key. Set REPLICATE_API_TOKEN (preferred) or REPLICATE_API_KEY in your terminal."
    );
  }

  // Ensure output directory exists
  await fs.mkdir(AUDIO_DIR, { recursive: true });

  const pendingTargets = [];
  for (const [key, text] of Object.entries(TARGETS)) {
    const outputPath = path.join(AUDIO_DIR, `${key}.m4a`);
    if (await fileExists(outputPath)) {
      console.log(`✓ Already exists: ${key}`);
    } else {
      pendingTargets.push({ key, text, outputPath });
    }
  }

  console.log(
    `\nFound ${Object.keys(TARGETS).length} sentence breakdowns (${pendingTargets.length} to generate, ${Object.keys(TARGETS).length - pendingTargets.length} existing).`
  );

  if (pendingTargets.length === 0) {
    console.log("Nothing to do. All audio files already exist.");
    return;
  }

  console.log(`\nPreparing to generate ${pendingTargets.length} clips with ${MODEL}...`);

  for (let index = 0; index < pendingTargets.length; index += 1) {
    const { key, text, outputPath } = pendingTargets[index];
    const label = `[${index + 1}/${pendingTargets.length}] ${key}: "${text}"`;
    console.log(`\n${label}`);

    const outputUrl = await runPrediction(apiKey, {
      text,
      key,
    });
    if (!outputUrl) {
      throw new Error(`No output URL returned for: ${key}`);
    }

    await writeAudio(outputUrl, outputPath);
    console.log(`✓ Saved: ${outputPath}`);
  }

  console.log("\n✓ All sentence breakdown audio files generated successfully.");
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function runPrediction(apiKey, target) {
  try {
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
      throw new Error(
        `Replicate create prediction failed (${response.status}): ${JSON.stringify(errorBody)}`
      );
    }

    let prediction = await response.json();

    while (prediction.status !== "succeeded") {
      if (prediction.status === "failed" || prediction.status === "canceled") {
        throw new Error(`Prediction ${prediction.id} ended with status: ${prediction.status}`);
      }

      if (!prediction.urls?.get) {
        throw new Error(`No polling URL in prediction response for ${target.key}`);
      }

      const pollResponse = await fetch(prediction.urls.get, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!pollResponse.ok) {
        throw new Error(
          `Polling failed (${pollResponse.status}) for prediction ${prediction.id}`
        );
      }

      prediction = await pollResponse.json();
    }

    return extractOutputUrl(prediction.output);
  } catch (error) {
    throw new Error(`Failed to generate audio for "${target.text}": ${error.message}`);
  }
}

function extractOutputUrl(output) {
  if (!output) {
    return null;
  }

  if (typeof output === "string") {
    return output;
  }

  if (Array.isArray(output)) {
    const first = output.find((item) => typeof item === "string");
    return first || null;
  }

  if (typeof output === "object") {
    if (typeof output.audio === "string") {
      return output.audio;
    }

    if (typeof output.url === "string") {
      return output.url;
    }

    const nestedString = Object.values(output).find((value) => typeof value === "string");
    return nestedString || null;
  }

  return null;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return { body: await response.text() };
  }
}

async function writeAudio(url, outputPath) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
  }

  const buffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(buffer));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
