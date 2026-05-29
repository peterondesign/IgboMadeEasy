export type HouseholdObjectsEntry = {
  english: string;
  igbo: string;
};

export const HOUSEHOLD_OBJECTS_ENTRIES: HouseholdObjectsEntry[] = [
  { english: "House", igbo: "ulo" },
  { english: "Room", igbo: "ime ulo" },
  { english: "Door", igbo: "uzo" },
  { english: "Window", igbo: "window" },
  { english: "Chair", igbo: "oche" },
  { english: "Table", igbo: "tebulu" },
  { english: "Bed", igbo: "akwa" },
  { english: "Pillow", igbo: "ohiri isi" },
  { english: "Mat", igbo: "ute" },
  { english: "Pot", igbo: "ite" },
  { english: "Spoon", igbo: "ngaji" },
  { english: "Plate", igbo: "efere" },
  { english: "Cup", igbo: "iko" },
  { english: "Broom", igbo: "azuza" },
  { english: "Bucket", igbo: "boketi" },
  { english: "Soap", igbo: "ncha" },
  { english: "Cloth", igbo: "akwa ejiji" },
  { english: "Light", igbo: "oku" },
  { english: "Key", igbo: "igodo" },
  { english: "Lock", igbo: "mkpuchi" }
];

export const HOUSEHOLD_OBJECTS_AUDIO: Record<string, number> = {};
