#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const MODEL = "google/gemini-3.1-flash-tts";
const FEMALE_VOICE = process.env.REPLICATE_TTS_FEMALE_VOICE || "Despina";
const FEMALE_STYLE_PROMPT =
  "Say the following in a Nigerian Igbo accent with a warm, clear female tone. Pronounce each word distinctly.";

const ROOT = process.cwd();
const AUDIO_DIR = path.join(ROOT, "assets/audio/sentence_breakdowns_examples_igbo");

const TARGETS = {
  "what-is-your-name-example": "Gini bu aha nwa gi?",
  "how-are-you-example": "Kedu ka ha mere?",
  "i-want-to-go-home-example": "Achoro m iri nri.",
  "i-do-not-understand-example": "Amaghi m okwu gi.",
  "i-am-hungry-example": "Aguu na agu ha.",
  "i-have-two-brothers-example": "Nwanne m ndị nwanyị atọ.",
  "i-will-come-tomorrow-example": "Ga a ị gaa n'ụlọ?",
  "where-is-our-sister-example": "Ebe ka nne gi no?",
  "they-are-tired-example": "Ọ wụrụ ngwu.",
  "we-are-thirsty-example": "O na agụ mmili.",
  "give-him-water-example": "Nye m ihe.",
  "he-is-going-to-the-river-to-fetch-water-example": "Ha na eje n'ụlọ.",
  "i-am-going-to-see-my-father-at-the-farm-example": "Ga m ahụ nne m n'afo.",
  "if-it-rains-we-will-stay-at-home-example": "Ọ bụrụ na ọ no mma, anyi ga eri.",
  "my-house-is-bigger-than-your-house-example": "Okwu ya bụ mma kar okwu m.",
  "shall-we-go-see-them-example": "Ka anyi rie nri.",
  "the-boy-who-is-playing-football-is-my-friend-example": "Nwata na ịde akwụkwọ bụ ọmụmụ m.",
  "they-are-playing-football-near-the-school-example": "Anyi na eje ibe.",
  "they-walked-a-long-distance-this-morning-example": "O gagara anya.",
  "we-can-go-tomorrow-example": "O nwere ike ibu ihe.",
  "we-cannot-go-home-example": "Ha agaghi abụ nwoke.",
};

async function main() {
  const apiKey = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Replicate API key. Set REPLICATE_API_TOKEN (preferred) or REPLICATE_API_KEY in your terminal."
    );
  }

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
    `\nFound ${Object.keys(TARGETS).length} example Igbo audio clips (${pendingTargets.length} to generate, ${Object.keys(TARGETS).length - pendingTargets.length} existing).`
  );

  if (pendingTargets.length === 0) {
    console.log("Nothing to do. All example audio files already exist.");
    return;
  }

  console.log(`\nPreparing to generate ${pendingTargets.length} clips with ${MODEL}...`);

  for (let index = 0; index < pendingTargets.length; index += 1) {
    const { key, text, outputPath } = pendingTargets[index];
    const label = `[${index + 1}/${pendingTargets.length}] ${key}: \"${text}\"`;
    console.log(`\n${label}`);

    const outputUrl = await runPrediction(apiKey, { text, key });
    if (!outputUrl) {
      throw new Error(`No output URL returned for: ${key}`);
    }

    await writeAudio(outputUrl, outputPath);
    console.log(`✓ Saved: ${outputPath}`);
  }

  console.log("\n✓ All sentence breakdown example audio files generated successfully as WAV.");
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
    throw new Error(`Failed to generate audio for \"${target.text}\": ${error.message}`);
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
