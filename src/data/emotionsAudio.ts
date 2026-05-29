export type EmotionsEntry = {
  english: string;
  igbo: string;
};

export const EMOTIONS_ENTRIES: EmotionsEntry[] = [
  { english: "Happy", igbo: "anụrị" },
  { english: "Sad", igbo: "mwute" },
  { english: "Angry", igbo: "iwe" },
  { english: "Afraid", igbo: "egwu" },
  { english: "Calm", igbo: "udo" },
  { english: "Excited", igbo: "obi ụtọ" },
  { english: "Tired", igbo: "ike agwu" },
  { english: "Worried", igbo: "nchegbu" },
  { english: "Surprised", igbo: "iju anya" },
  { english: "Proud", igbo: "nganga oma" },
  { english: "Love", igbo: "ịhụnanya" },
  { english: "Hate", igbo: "ikpo asi" },
  { english: "Hope", igbo: "olile anya" },
  { english: "Shame", igbo: "ihere" },
  { english: "Peace", igbo: "udo zuru oke" },
  { english: "Joy", igbo: "obi anụrị" },
  { english: "Pain", igbo: "mgbu" },
  { english: "Stress", igbo: "nchekasi" },
  { english: "Trust", igbo: "ntukwasị obi" },
  { english: "Forgive", igbo: "gbaghara" },
];

export const EMOTIONS_AUDIO: Record<string, number> = {
  "anụrị": require("../../assets/audio/emotions/anuri.wav"),
  "mwute": require("../../assets/audio/emotions/mwute.wav"),
  "iwe": require("../../assets/audio/emotions/iwe.wav"),
  "egwu": require("../../assets/audio/emotions/egwu.wav"),
  "udo": require("../../assets/audio/emotions/udo.wav"),
  "obi ụtọ": require("../../assets/audio/emotions/obi-uto.wav"),
  "ike agwu": require("../../assets/audio/emotions/ike-agwu.wav"),
  "nchegbu": require("../../assets/audio/emotions/nchegbu.wav"),
  "iju anya": require("../../assets/audio/emotions/iju-anya.wav"),
  "nganga oma": require("../../assets/audio/emotions/nganga-oma.wav"),
  "ịhụnanya": require("../../assets/audio/emotions/ihunanya.wav"),
  "ikpo asi": require("../../assets/audio/emotions/ikpo-asi.wav"),
  "olile anya": require("../../assets/audio/emotions/olile-anya.wav"),
  "ihere": require("../../assets/audio/emotions/ihere.wav"),
  "udo zuru oke": require("../../assets/audio/emotions/udo-zuru-oke.wav"),
  "obi anụrị": require("../../assets/audio/emotions/obi-anuri.wav"),
  "mgbu": require("../../assets/audio/emotions/mgbu.wav"),
  "nchekasi": require("../../assets/audio/emotions/nchekasi.wav"),
  "ntukwasị obi": require("../../assets/audio/emotions/ntukwasi-obi.wav"),
  "gbaghara": require("../../assets/audio/emotions/gbaghara.wav"),
};
