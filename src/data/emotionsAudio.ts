export type EmotionsEntry = {
  english: string;
  igbo: string;
};

export const EMOTIONS_ENTRIES: EmotionsEntry[] = [
  { english: "Happy", igbo: "anuri" },
  { english: "Sad", igbo: "mwute" },
  { english: "Angry", igbo: "iwe" },
  { english: "Afraid", igbo: "egwu" },
  { english: "Calm", igbo: "udo" },
  { english: "Excited", igbo: "obi uto" },
  { english: "Tired", igbo: "ike agwu" },
  { english: "Worried", igbo: "nchegbu" },
  { english: "Surprised", igbo: "iju anya" },
  { english: "Proud", igbo: "nganga oma" },
  { english: "Love", igbo: "ihunanya" },
  { english: "Hate", igbo: "ikpo asi" },
  { english: "Hope", igbo: "olile anya" },
  { english: "Shame", igbo: "ihere" },
  { english: "Peace", igbo: "udo zuru oke" },
  { english: "Joy", igbo: "obi anuri" },
  { english: "Pain", igbo: "mgbu" },
  { english: "Stress", igbo: "nchekasi" },
  { english: "Trust", igbo: "ntukwasi obi" },
  { english: "Forgive", igbo: "gbaghara" }
];

export const EMOTIONS_AUDIO: Record<string, number> = {};
