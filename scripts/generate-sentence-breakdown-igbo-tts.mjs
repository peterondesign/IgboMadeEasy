#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const MODEL = "google/gemini-3.1-flash-tts";
const FEMALE_VOICE = process.env.REPLICATE_TTS_FEMALE_VOICE || "Despina";
const FEMALE_STYLE_PROMPT =
  "Say the following in a Nigerian Igbo accent with a warm, clear female tone. Pronounce each word distinctly.";

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, "assets/audio/sentence_breakdowns_igbo");

// Map of audio key to Igbo sentence for pronunciation
const TARGETS = {
  // Introduction to Igbo (10)
  "what-is-your-name": "Gini bu aha gi?",
  "how-are-you": "Kedu ka i mere?",
  "i-want-to-go-home": "Achoro m iju ụlọ.",
  "i-do-not-understand": "Amaghi m.",
  "i-am-hungry": "Aguu na agu m.",
  "i-have-two-brothers": "Nwanne m ndị nwoke abụọ.",
  "i-will-come-tomorrow": "Ga m abịa echi.",
  "where-is-our-sister": "Ebe ka nne anyi no?",
  "they-are-tired": "Ha wụrụ ngwu.",
  "we-are-thirsty": "Anyi na agụ mmili.",
  
  // Getting Started (11)
  "give-him-water": "Nye ya mmili.",
  "he-is-going-to-the-river-to-fetch-water": "O na eje n'ime mmiri iji kpukuru mmili.",
  "i-am-going-to-see-my-father-at-the-farm": "Ga m ahụ pa m n'ibe.",
  "if-it-rains-we-will-stay-at-home": "Ọ bụrụ na ewe anyi ga nọdụ n'ụlọ.",
  "my-house-is-bigger-than-your-house": "Ụlọ m bụ nnukwu kar ụlọ gi.",
  "shall-we-go-see-them": "Ka anyi gaa hụ ha?",
  "the-boy-who-is-playing-football-is-my-friend": "Nwata nwoke na egwu bọọlu bụ enyi m.",
  "they-are-playing-football-near-the-school": "Ha na egwu bọọlu n'akụkụ ụlọ akwụkwọ.",
  "they-walked-a-long-distance-this-morning": "Ha gagara anya ogologo n'ụtụtụ taa.",
  "we-can-go-tomorrow": "Anyi nwere ike iju echi.",
  "we-cannot-go-home": "Anyi agaghi uju ụlọ.",
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
    const outputPath = path.join(AUDIO_DIR, `${key}.wav`);
    if (await fileExists(outputPath)) {
      console.log(`✓ Already exists: ${key}`);
    } else {
      pendingTargets.push({ key, text, outputPath });
    }
  }

  console.log(
    `\nFound ${Object.keys(TARGETS).length} Igbo audio clips (${pendingTargets.length} to generate, ${Object.keys(TARGETS).length - pendingTargets.length} existing).`
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

  console.log("\n✓ All Igbo sentence breakdown audio files generated successfully as WAV.");
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
            language_code: "en-US", // English with Igbo text - model handles multilingual input
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
