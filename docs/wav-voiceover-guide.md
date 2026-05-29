# Igbo WAV Voiceover Guide (Next Steps)

This guide helps you prepare production-ready `.wav` files for the app while preserving correct Igbo spellings in UI text.

## 1. Recording spec (recommended)

- Format: WAV PCM (uncompressed)
- Channels: Mono
- Sample rate: 48,000 Hz (preferred) or 44,100 Hz
- Bit depth: 16-bit or 24-bit
- Peak target: around -3 dBFS max peak
- Loudness target (spoken voice): around -18 to -16 LUFS integrated
- Noise floor: below -50 dBFS if possible

Why: this is stable for mobile playback, small enough when trimmed, and easy to batch process.

## 2. Folder and naming convention

Use ASCII-safe filenames only, but keep full Igbo spelling in metadata/text files.

Example:

- Spoken phrase: `Kedu ka i mere?`
- Display text (UI): `Kedu ka i mere?`
- Filename: `kedu-ka-i-mere.wav`

Recommended structure:

- `assets/audio/greetings/`
- `assets/audio/greetings/translations.json` (already in project)
- `src/data/greetingsAudio.ts` (phrase -> file mapping)

## 3. Keep two truths: display text vs file key

- Display text: keep full correct Igbo orthography (including diacritics where needed)
- File key/filename: keep ASCII-safe slug

Practical pattern:

1. Maintain canonical phrase list with correct spelling.
2. Maintain explicit mapping from phrase to file asset.
3. Never derive phrase text from filename.

## 4. Recording checklist per line

- One phrase per file
- Leave ~100 ms silence at start and end
- Remove clicks/breath pops where possible
- Keep consistent speaking speed and tone
- Re-record any line with background noise or clipping

## 5. Batch cleanup workflow (Audacity or DAW)

For each clip:

1. Trim silence
2. Noise reduction (light)
3. High-pass filter around 70-90 Hz (optional)
4. Gentle compression (2:1 to 3:1, light gain reduction)
5. Normalize peak to about -3 dBFS
6. Export WAV PCM mono

Do not overprocess; intelligibility matters more than loudness.

## 6. Igbo spelling quality control

Before import, review each phrase with a native speaker/linguist for:

- Correct tone marks and diacritics (if your curriculum uses them)
- Correct spacing and punctuation
- Consistency (same word written the same way everywhere)

Keep an approval sheet with columns:

- `phrase_display`
- `english_translation`
- `filename`
- `speaker_approved` (yes/no)
- `notes`

## 7. Integration steps in this repo

When new audio is ready:

1. Add wav files under `assets/audio/<lesson>/`
2. Add or update phrase->audio mapping file in `src/data/`
3. Add translations JSON for the lesson
4. Mark lesson as audio-ready in app config:
   - Update `AUDIO_READY_LESSON_IDS` in `App.tsx`
5. Restart Expo with cache clear:
   - `npx expo start -c`

## 8. Validation pass on device

For each phrase:

- Audio plays immediately on tap
- No wrong/missing clip mapping
- Correct Igbo text shown in UI
- Translation matches spoken phrase
- Volume is consistent across clips

## 9. Common pitfalls to avoid

- Using MP3 with inconsistent bitrate and loudness
- Auto-generating filenames from Igbo text with special characters
- Mixing spelling variants across files
- Leaving lessons enabled before their audio mappings are complete

## 10. Suggested next delivery from you

Provide per lesson:

- Final phrase list (approved Igbo spelling)
- English translations
- WAV files named with ASCII-safe slugs
- Optional notes on pronunciation variants

Once you send that, the lesson can be unlocked safely with predictable behavior.
