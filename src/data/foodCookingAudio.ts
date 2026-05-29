export type FoodCookingEntry = {
  english: string;
  igbo: string;
};

export const FOOD_COOKING_ENTRIES: FoodCookingEntry[] = [
  { english: "Food", igbo: "nri" },
  { english: "Water", igbo: "mmiri" },
  { english: "Soup", igbo: "ofe" },
  { english: "Rice", igbo: "osikapa" },
  { english: "Yam", igbo: "ji" },
  { english: "Pepper", igbo: "ose" },
  { english: "Salt", igbo: "nnu" },
  { english: "Cook", igbo: "sie" },
  { english: "Eat", igbo: "rie" },
  { english: "Kitchen", igbo: "ụlọ esi nri" },
];

export const FOOD_COOKING_AUDIO: Record<string, number> = {
  "nri": require("../../assets/audio/food-cooking/nri.wav"),
  "mmiri": require("../../assets/audio/food-cooking/mmiri.wav"),
  "ofe": require("../../assets/audio/food-cooking/ofe.wav"),
  "osikapa": require("../../assets/audio/food-cooking/osikapa.wav"),
  "ji": require("../../assets/audio/food-cooking/ji.wav"),
  "ose": require("../../assets/audio/food-cooking/ose.wav"),
  "nnu": require("../../assets/audio/food-cooking/nnu.wav"),
  "sie": require("../../assets/audio/food-cooking/sie.wav"),
  "rie": require("../../assets/audio/food-cooking/rie.wav"),
  "ụlọ esi nri": require("../../assets/audio/food-cooking/ulo-esi-nri.wav"),
};
