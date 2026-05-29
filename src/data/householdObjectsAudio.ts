export type HouseholdObjectsEntry = {
  english: string;
  igbo: string;
};

export const HOUSEHOLD_OBJECTS_ENTRIES: HouseholdObjectsEntry[] = [
  { english: "House", igbo: "ụlọ" },
  { english: "Room", igbo: "ime ụlọ" },
  { english: "Door", igbo: "ụzọ" },
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
  { english: "Bucket", igbo: "bọketi" },
  { english: "Soap", igbo: "ncha" },
  { english: "Cloth", igbo: "akwa ejiji" },
  { english: "Light", igbo: "ọkụ" },
  { english: "Key", igbo: "igodo" },
  { english: "Lock", igbo: "mkpuchi" },
];

export const HOUSEHOLD_OBJECTS_AUDIO: Record<string, number> = {
  "ụlọ": require("../../assets/audio/household-objects/ulo.wav"),
  "ime ụlọ": require("../../assets/audio/household-objects/ime-ulo.wav"),
  "ụzọ": require("../../assets/audio/household-objects/uzo.wav"),
  "window": require("../../assets/audio/household-objects/window.wav"),
  "oche": require("../../assets/audio/household-objects/oche.wav"),
  "tebulu": require("../../assets/audio/household-objects/tebulu.wav"),
  "akwa": require("../../assets/audio/household-objects/akwa.wav"),
  "ohiri isi": require("../../assets/audio/household-objects/ohiri-isi.wav"),
  "ute": require("../../assets/audio/household-objects/ute.wav"),
  "ite": require("../../assets/audio/household-objects/ite.wav"),
  "ngaji": require("../../assets/audio/household-objects/ngaji.wav"),
  "efere": require("../../assets/audio/household-objects/efere.wav"),
  "iko": require("../../assets/audio/household-objects/iko.wav"),
  "azuza": require("../../assets/audio/household-objects/azuza.wav"),
  "bọketi": require("../../assets/audio/household-objects/boketi.wav"),
  "ncha": require("../../assets/audio/household-objects/ncha.wav"),
  "akwa ejiji": require("../../assets/audio/household-objects/akwa-ejiji.wav"),
  "ọkụ": require("../../assets/audio/household-objects/oku.wav"),
  "igodo": require("../../assets/audio/household-objects/igodo.wav"),
  "mkpuchi": require("../../assets/audio/household-objects/mkpuchi.wav"),
};
