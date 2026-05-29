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
  { english: "Kitchen", igbo: "ulo esi nri" }
];

export const FOOD_COOKING_AUDIO: Record<string, number> = {};
