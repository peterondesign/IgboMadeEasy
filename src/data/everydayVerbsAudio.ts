export type EverydayVerbEntry = {
  english: string;
  igbo: string;
};

export const EVERYDAY_VERBS_ENTRIES: EverydayVerbEntry[] = [
  { english: "I go to work every morning.", igbo: "a na m aga oru kwa ututu" },
  { english: "She comes home late.", igbo: "o biarutere n'ulo mgbe e mesiri" },
  {
    english: "They eat rice for dinner.",
    igbo: "ha na-eri osikapa maka nri mgbede",
  },
  {
    english: "He drinks water after football.",
    igbo: "o na-anu mmiri mgbe egwuregwu bol gachara",
  },
  {
    english: "We sleep early during the week.",
    igbo: "anyi na-ehi ura n'oge izu",
  },
  { english: "You walk very fast.", igbo: "i na-eje ije ngwa ngwa nke ukwuu" },
  { english: "The children are running.", igbo: "umuaka na-agba oso" },
  { english: "My father is sitting.", igbo: "nna m no n'oche" },
  { english: "My mother is sitting.", igbo: "nne m no n'oche" },
  { english: "I am drinking orange juice.", igbo: "ana m anu mmiri oroma" },
  {
    english: "The teacher stands at the front of the class.",
    igbo: "onye nkuzi kwu n'ihu klaasi",
  },
  { english: "They want a new house.", igbo: "ha choro ulo ohuru" },
  { english: "She gives me a gift.", igbo: "o na-enye m onyinye" },
  {
    english: "We like listening to music.",
    igbo: "anyi na-enwe mmasi inu egwu",
  },
  { english: "to like", igbo: "iji masi" },
  { english: "to walk", igbo: "iga ije" },
  { english: "to come", igbo: "ibia" },
  { english: "to run", igbo: "igba oso" },
  { english: "to stand", igbo: "ikwu odu" },
  { english: "to want", igbo: "icho" },
];

export const EVERYDAY_VERBS_AUDIO: Record<string, number> = {
  "a na m aga oru kwa ututu": require("../../assets/audio/everyday-verbs/A na m aga ọrụ kwa ụtụtụ..wav"),
  "o biarutere n'ulo mgbe e mesiri": require("../../assets/audio/everyday-verbs/Ọ bịarutere n'ụlọ mgbe e mesịrị.wav"),
  "ha na-eri osikapa maka nri mgbede": require("../../assets/audio/everyday-verbs/Ha na-eri osikapa maka nri mgbede. .wav"),
  "o na-anu mmiri mgbe egwuregwu bol gachara": require("../../assets/audio/everyday-verbs/Ọ na-aṅụ mmiri mgbe egwuregwu bọl gachara.wav"),
  "anyi na-ehi ura n'oge izu": require("../../assets/audio/everyday-verbs/Anyị na-ehi ụra n'oge izu..wav"),
  "i na-eje ije ngwa ngwa nke ukwuu": require("../../assets/audio/everyday-verbs/Ị na-eje ije ngwa ngwa nke ukwuu. .wav"),
  "umuaka na-agba oso": require("../../assets/audio/everyday-verbs/Ụmụaka na-agba ọsọ .wav"),
  "nna m no n'oche": require("../../assets/audio/everyday-verbs/Nna m nọ n'oche..wav"),
  "nne m no n'oche": require("../../assets/audio/everyday-verbs/Nne m nọ n'oche.wav"),
  "ana m anu mmiri oroma": require("../../assets/audio/everyday-verbs/Ana m aṅụ mmiri oroma.wav"),
  "onye nkuzi kwu n'ihu klaasi": require("../../assets/audio/everyday-verbs/Onye nkuzi kwụ n'ihu klaasị.wav"),
  "ha choro ulo ohuru": require("../../assets/audio/everyday-verbs/Ha chọrọ ụlọ ọhụrụ.wav"),
  "o na-enye m onyinye": require("../../assets/audio/everyday-verbs/Ọ na-enye m onyinye.wav"),
  "anyi na-enwe mmasi inu egwu": require("../../assets/audio/everyday-verbs/Anyị na-enwe mmasị ịnụ egwu.wav"),
  "iji masi": require("../../assets/audio/everyday-verbs/iji masị.wav"),
  "iga ije": require("../../assets/audio/everyday-verbs/ịga ije.wav"),
  "ibia": require("../../assets/audio/everyday-verbs/ịbịa.wav"),
  "igba oso": require("../../assets/audio/everyday-verbs/ịgba ọsọ.wav"),
  "icho": require("../../assets/audio/everyday-verbs/ịchọ.wav"),
};
