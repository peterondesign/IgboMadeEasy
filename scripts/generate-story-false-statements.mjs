import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CHATGPT_MODEL = process.env.CHATGPT_MODEL || "gpt-4.1-mini";
const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY || process.env.CHATGPT_API_KEY;

const DEFAULT_FIVE_LESSONS = [
  "greetings",
  "everyday-verbs",
  "asking-questions",
  "food-cooking",
  "family-people",
];

async function main() {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "Missing API key. Set OPENAI_API_KEY (or CHATGPT_API_KEY) before running this script."
    );
  }

  const { lessons, dryRun } = parseArgs(process.argv.slice(2));

  console.log(
    `Generating subtle false statements for ${lessons.length} lesson(s) using ${CHATGPT_MODEL}...`
  );

  for (const lesson of lessons) {
    const storyPath = path.join(ROOT, "assets", "audio", lesson, "story-dialogue.json");

    const raw = await fs.readFile(storyPath, "utf8");
    const entries = JSON.parse(raw);

    if (!Array.isArray(entries) || entries.length === 0) {
      console.log(`- ${lesson}: skipped (no entries)`);
      continue;
    }

    const resultMap = await generateFalseStatementsForLesson(lesson, entries);

    let changed = 0;
    const nextEntries = entries.map((entry, index) => {
      const falseStatement = resultMap.get(index);
      if (!falseStatement) {
        return entry;
      }

      if ((entry.falseStatement || "").trim() !== falseStatement.trim()) {
        changed += 1;
      }

      return {
        ...entry,
        falseStatement,
      };
    });

    if (dryRun) {
      console.log(`- ${lesson}: ${changed} entries would be updated`);
      continue;
    }

    await fs.writeFile(storyPath, `${JSON.stringify(nextEntries, null, 2)}\n`, "utf8");
    console.log(`- ${lesson}: updated ${changed} entries`);
  }

  console.log("Done.");
}

function parseArgs(args) {
  const lessonsArg = args.find((arg) => arg.startsWith("--lessons="));
  const dryRun = args.includes("--dry-run");

  if (!lessonsArg) {
    return { lessons: DEFAULT_FIVE_LESSONS, dryRun };
  }

  const lessonValues = lessonsArg
    .replace("--lessons=", "")
    .split(",")
    .map((lesson) => lesson.trim())
    .filter(Boolean);

  if (lessonValues.length === 0) {
    return { lessons: DEFAULT_FIVE_LESSONS, dryRun };
  }

  return { lessons: lessonValues, dryRun };
}

async function generateFalseStatementsForLesson(lesson, entries) {
  const minimalEntries = entries.map((entry, index) => ({
    index,
    speaker: entry.speaker,
    englishText: entry.englishText,
    trueStatement: entry.statement,
  }));

  const systemPrompt = [
    "You write subtle false quiz statements.",
    "For each item, produce ONE false statement that is a slight alternate of the true statement.",
    "Rules:",
    "1) Keep style and tense close to the true statement.",
    "2) Change only a small detail (person, quantity, timing, object, location, polarity) so it is false given englishText.",
    "3) Keep statement short, natural, and child-friendly.",
    "4) Do not use words like 'not true', 'incorrect', or explain why.",
    "5) Preserve speaker labels like Dad/The daughter when present.",
    "Return ONLY JSON object: {\"results\":[{\"index\":number,\"falseStatement\":string}]}.",
  ].join("\n");

  const userPrompt = JSON.stringify(
    {
      lesson,
      items: minimalEntries,
    },
    null,
    2
  );

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: CHATGPT_MODEL,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await safeResponseText(response);
    throw new Error(
      `OpenAI request failed for lesson '${lesson}' (${response.status}): ${errorText}`
    );
  }

  const json = await response.json();
  const responseText = extractResponseText(json);
  const parsed = parseJsonObject(responseText);

  if (!parsed || !Array.isArray(parsed.results)) {
    throw new Error(`Invalid JSON payload returned for lesson '${lesson}'.`);
  }

  const map = new Map();
  for (const row of parsed.results) {
    if (
      typeof row?.index === "number" &&
      Number.isInteger(row.index) &&
      row.index >= 0 &&
      row.index < entries.length &&
      typeof row?.falseStatement === "string" &&
      row.falseStatement.trim().length > 0
    ) {
      map.set(row.index, row.falseStatement.trim());
    }
  }

  if (map.size !== entries.length) {
    throw new Error(
      `Model returned ${map.size}/${entries.length} false statements for lesson '${lesson}'.`
    );
  }

  return map;
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }

  if (Array.isArray(payload?.output)) {
    const chunks = [];

    for (const item of payload.output) {
      if (!Array.isArray(item?.content)) {
        continue;
      }

      for (const content of item.content) {
        if (typeof content?.text === "string") {
          chunks.push(content.text);
        }
      }
    }

    if (chunks.length > 0) {
      return chunks.join("\n");
    }
  }

  throw new Error("Unable to read text from OpenAI response.");
}

function parseJsonObject(text) {
  const direct = safelyParseJson(text);
  if (direct) {
    return direct;
  }

  const blockMatch = text.match(/\{[\s\S]*\}/);
  if (!blockMatch) {
    return null;
  }

  return safelyParseJson(blockMatch[0]);
}

function safelyParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function safeResponseText(response) {
  try {
    return await response.text();
  } catch {
    return "Unable to read response body";
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
