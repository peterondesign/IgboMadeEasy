export type HealthEntry = {
  english: string;
  igbo: string;
};

export const HEALTH_ENTRIES: HealthEntry[] = [
  { english: "Health", igbo: "ahike" },
  { english: "Hospital", igbo: "ulo ogwu" },
  { english: "Doctor", igbo: "dibia" },
  { english: "Nurse", igbo: "onye nlezi" },
  { english: "Medicine", igbo: "ogwu" },
  { english: "Sick", igbo: "oria" },
  { english: "Pain", igbo: "mgbu" },
  { english: "Headache", igbo: "isi mgbu" },
  { english: "Fever", igbo: "ahu oku" },
  { english: "Cough", igbo: "ukwara" },
  { english: "Body", igbo: "ahu" },
  { english: "Hand", igbo: "aka" },
  { english: "Leg", igbo: "ukwu" },
  { english: "Eye", igbo: "anya" },
  { english: "Mouth", igbo: "onu" },
  { english: "Sleep", igbo: "hie ura" },
  { english: "Rest", igbo: "zuo ike" },
  { english: "Eat well", igbo: "rie nke oma" },
  { english: "Drink water", igbo: "nuo mmiri" },
  { english: "Recover", igbo: "gbakee" }
];

export const HEALTH_AUDIO: Record<string, number> = {};
