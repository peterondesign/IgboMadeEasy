export type HealthEntry = {
  english: string;
  igbo: string;
};

export const HEALTH_ENTRIES: HealthEntry[] = [
  { english: "Health", igbo: "ahike" },
  { english: "Hospital", igbo: "ụlọ ọgwụ" },
  { english: "Doctor", igbo: "dibia" },
  { english: "Nurse", igbo: "onye nlezi" },
  { english: "Medicine", igbo: "ọgwụ" },
  { english: "Sick", igbo: "ọrịa" },
  { english: "Pain", igbo: "mgbu" },
  { english: "Headache", igbo: "isi mgbu" },
  { english: "Fever", igbo: "ahụ ọkụ" },
  { english: "Cough", igbo: "ụkwara" },
  { english: "Body", igbo: "ahụ" },
  { english: "Hand", igbo: "aka" },
  { english: "Leg", igbo: "ukwu" },
  { english: "Eye", igbo: "anya" },
  { english: "Mouth", igbo: "ọnụ" },
  { english: "Sleep", igbo: "hie ụra" },
  { english: "Rest", igbo: "zuo ike" },
  { english: "Eat well", igbo: "rie nke ọma" },
  { english: "Drink water", igbo: "ṅụọ mmiri" },
  { english: "Recover", igbo: "gbakee" },
];

export const HEALTH_AUDIO: Record<string, number> = {
  "ahike": require("../../assets/audio/health/ahike.wav"),
  "ụlọ ọgwụ": require("../../assets/audio/health/ulo-ogwu.wav"),
  "dibia": require("../../assets/audio/health/dibia.wav"),
  "onye nlezi": require("../../assets/audio/health/onye-nlezi.wav"),
  "ọgwụ": require("../../assets/audio/health/ogwu.wav"),
  "ọrịa": require("../../assets/audio/health/oria.wav"),
  "mgbu": require("../../assets/audio/health/mgbu.wav"),
  "isi mgbu": require("../../assets/audio/health/isi-mgbu.wav"),
  "ahụ ọkụ": require("../../assets/audio/health/ahu-oku.wav"),
  "ụkwara": require("../../assets/audio/health/ukwara.wav"),
  "ahụ": require("../../assets/audio/health/ahu.wav"),
  "aka": require("../../assets/audio/health/aka.wav"),
  "ukwu": require("../../assets/audio/health/ukwu.wav"),
  "anya": require("../../assets/audio/health/anya.wav"),
  "ọnụ": require("../../assets/audio/health/onu.wav"),
  "hie ụra": require("../../assets/audio/health/hie-ura.wav"),
  "zuo ike": require("../../assets/audio/health/zuo-ike.wav"),
  "rie nke ọma": require("../../assets/audio/health/rie-nke-oma.wav"),
  "ṅụọ mmiri": require("../../assets/audio/health/nuo-mmiri.wav"),
  "gbakee": require("../../assets/audio/health/gbakee.wav"),
};
