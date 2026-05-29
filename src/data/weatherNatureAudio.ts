export type WeatherNatureEntry = {
  english: string;
  igbo: string;
};

export const WEATHER_NATURE_ENTRIES: WeatherNatureEntry[] = [
  { english: "Weather", igbo: "ihu igwe" },
  { english: "Rain", igbo: "mmiri ozuzo" },
  { english: "Sun", igbo: "anyu" },
  { english: "Cloud", igbo: "igwe ojii" },
  { english: "Wind", igbo: "ifufe" },
  { english: "Storm", igbo: "oke ifufe" },
  { english: "Cold", igbo: "oyi" },
  { english: "Hot", igbo: "oku" },
  { english: "Morning", igbo: "ututu" },
  { english: "Night", igbo: "abali" },
  { english: "Tree", igbo: "osisi" },
  { english: "Leaf", igbo: "akwukwo osisi" },
  { english: "River", igbo: "osimiri" },
  { english: "Mountain", igbo: "ugwu" },
  { english: "Forest", igbo: "ohia" },
  { english: "Earth", igbo: "ala" },
  { english: "Sky", igbo: "elu igwe" },
  { english: "Season", igbo: "oge" },
  { english: "Dry season", igbo: "oge okpomoku" },
  { english: "Rainy season", igbo: "oge mmiri" }
];

export const WEATHER_NATURE_AUDIO: Record<string, number> = {};
