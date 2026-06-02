import fs from "node:fs/promises";
import path from "node:path";

const MODEL = "google/gemini-3.1-flash-tts";
const MALE_VOICE = process.env.REPLICATE_TTS_MALE_VOICE || "Algenib";
const FEMALE_VOICE = process.env.REPLICATE_TTS_FEMALE_VOICE || "Despina";
const VERY_YOUNG_GIRL_VOICE =
  process.env.REPLICATE_TTS_VERY_YOUNG_GIRL_VOICE || FEMALE_VOICE;
const MALE_STYLE_PROMPT =
  "Say the following in a Nigerian Igbo accent with a warm fatherly tone.";
const FEMALE_STYLE_PROMPT =
  "Say the following in a Nigerian Igbo accent with a warm young female tone.";
const VERY_YOUNG_GIRL_STYLE_PROMPT =
  "Say the following in a Nigerian Igbo accent with a playful, very young girl tone.";
const LANGUAGE_CODE = "en-US";

const ROOT = process.cwd();

async function main() {
  const apiKey = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing Replicate API key. Set REPLICATE_API_TOKEN (preferred) or REPLICATE_API_KEY in your terminal."
    );
  }

  const existingAudioTargets = await loadMappedAudioTargets();
  const storyAudioTargets = await loadStoryAudioTargets();
  const generatedLessonTargets = await loadGeneratedLessonTargets();
  const targets = [
    ...existingAudioTargets,
    ...storyAudioTargets,
    ...generatedLessonTargets,
  ];
  const pendingTargets = [];

  for (const target of targets) {
    if (await fileExists(target.outputPath)) {
      continue;
    }

    pendingTargets.push(target);
  }

  const skippedCount = targets.length - pendingTargets.length;
  console.log(
    `Found ${targets.length} clips (${pendingTargets.length} to generate, ${skippedCount} existing).`
  );

  if (pendingTargets.length === 0) {
    console.log("Nothing to do. All audio files already exist.");
    return;
  }

  console.log(`Preparing to generate ${pendingTargets.length} clips with ${MODEL}...`);

  for (let index = 0; index < pendingTargets.length; index += 1) {
    const target = pendingTargets[index];
    const label = `[${index + 1}/${pendingTargets.length}] ${target.lesson}: ${target.text}`;
    console.log(`\n${label}`);

    const outputUrl = await runPrediction(apiKey, target);
    if (!outputUrl) {
      throw new Error(`No output URL returned for: ${target.text}`);
    }

    await writeAudio(outputUrl, target.outputPath, apiKey);
    console.log(`Saved: ${target.outputPath}`);
  }

  console.log("\nDone. Audio files replaced/generated successfully.");
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadMappedAudioTargets() {
  const files = [
    path.join(ROOT, "src/data/greetingsAudio.ts"),
    path.join(ROOT, "src/data/everydayVerbsAudio.ts"),
  ];

  const allTargets = [];

  for (const filePath of files) {
    const fileText = await fs.readFile(filePath, "utf8");
    const lesson = filePath.includes("greetings") ? "greetings" : "everyday-verbs";
    const matches = fileText.matchAll(
      /"(?<text>[^"]+)":\s*require\("(?<asset>[^\"]+)"\)/g
    );

    for (const match of matches) {
      const text = match.groups?.text;
      const asset = match.groups?.asset;
      if (!text || !asset) {
        continue;
      }

      allTargets.push({
        lesson,
        text,
        outputPath: path.join(ROOT, asset.replace(/^(\.\.\/)+/, "")),
        voiceProfile: "male",
      });
    }
  }

  return allTargets;
}

async function loadStoryAudioTargets() {
  const audioRoot = path.join(ROOT, "assets/audio");
  const lessonEntries = await fs.readdir(audioRoot, { withFileTypes: true });
  const targets = [];

  for (const lessonEntry of lessonEntries) {
    if (!lessonEntry.isDirectory()) {
      continue;
    }

    const lesson = lessonEntry.name;
    const storyFilePath = path.join(audioRoot, lesson, "story-dialogue.json");

    if (!(await fileExists(storyFilePath))) {
      continue;
    }

    const entries = JSON.parse(await fs.readFile(storyFilePath, "utf8"));

    for (const entry of entries) {
      if (!entry?.igboText || !entry?.audioKey) {
        continue;
      }

      targets.push({
        lesson: `${lesson}-story`,
        text: entry.igboText,
        outputPath: path.join(ROOT, `assets/audio/${lesson}/story/${entry.audioKey}.wav`),
        voiceProfile:
          entry.voice === "very-young-girl"
            ? "very-young-girl"
            : entry.voice === "female"
              ? "female"
              : "male",
      });
    }
  }

  return targets;
}

async function loadGeneratedLessonTargets() {
  const audioRoot = path.join(ROOT, "assets/audio");
  const dirEntries = await fs.readdir(audioRoot, { withFileTypes: true });
  const lessons = dirEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((lesson) => lesson !== "greetings" && lesson !== "everyday-verbs");
  const targets = [];

  for (const lesson of lessons) {
    const jsonPath = path.join(ROOT, `assets/audio/${lesson}/translations.json`);
    let parsed;

    try {
      parsed = JSON.parse(await fs.readFile(jsonPath, "utf8"));
    } catch {
      continue;
    }

    for (const igboText of Object.keys(parsed)) {
      targets.push({
        lesson,
        text: igboText,
        outputPath: path.join(
          ROOT,
          `assets/audio/${lesson}/${slugifyAscii(igboText)}.wav`
        ),
        voiceProfile: "male",
      });
    }
  }

  return targets;
}

async function runPrediction(apiKey, target) {
  const voice =
    target.voiceProfile === "very-young-girl"
      ? VERY_YOUNG_GIRL_VOICE
      : target.voiceProfile === "female"
        ? FEMALE_VOICE
        : MALE_VOICE;
  const prompt =
    target.voiceProfile === "very-young-girl"
      ? VERY_YOUNG_GIRL_STYLE_PROMPT
      : target.voiceProfile === "female"
        ? FEMALE_STYLE_PROMPT
        : MALE_STYLE_PROMPT;
  const prefix =
    target.voiceProfile === "very-young-girl"
      ? "[like a very young Igbo girl]"
      : target.voiceProfile === "female"
        ? "[like an Igbo woman]"
        : "[like an Igbo man]";

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
          text: `${prefix} ${target.text}`,
          voice,
          prompt,
          language_code: LANGUAGE_CODE,
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

    const pollResponse = await fetch(prediction.urls.get, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!pollResponse.ok) {
      throw new Error(`Polling failed (${pollResponse.status}) for prediction ${prediction.id}`);
    }

    prediction = await pollResponse.json();
  }

  return extractOutputUrl(prediction.output);
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

async function writeAudio(url, outputPath, apiKey) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download audio (${response.status}) from ${url}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, bytes);
}

function slugifyAscii(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return { message: "Unable to parse error body" };
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
