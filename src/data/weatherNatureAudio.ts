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
  { english: "Hot", igbo: "ọkụ" },
  { english: "Morning", igbo: "ututu" },
  { english: "Night", igbo: "abalị" },
  { english: "Tree", igbo: "osisi" },
  { english: "Leaf", igbo: "akwụkwọ osisi" },
  { english: "River", igbo: "osimiri" },
  { english: "Mountain", igbo: "ugwu" },
  { english: "Forest", igbo: "ọhịa" },
  { english: "Earth", igbo: "ala" },
  { english: "Sky", igbo: "elu igwe" },
  { english: "Season", igbo: "oge" },
  { english: "Dry season", igbo: "oge okpomoku" },
  { english: "Rainy season", igbo: "oge mmiri" },
];

export const WEATHER_NATURE_AUDIO: Record<string, number> = {
  "ihu igwe": require("../../assets/audio/weather-nature/ihu-igwe.wav"),
  "mmiri ozuzo": require("../../assets/audio/weather-nature/mmiri-ozuzo.wav"),
  "anyu": require("../../assets/audio/weather-nature/anyu.wav"),
  "igwe ojii": require("../../assets/audio/weather-nature/igwe-ojii.wav"),
  "ifufe": require("../../assets/audio/weather-nature/ifufe.wav"),
  "oke ifufe": require("../../assets/audio/weather-nature/oke-ifufe.wav"),
  "oyi": require("../../assets/audio/weather-nature/oyi.wav"),
  "ọkụ": require("../../assets/audio/weather-nature/oku.wav"),
  "ututu": require("../../assets/audio/weather-nature/ututu.wav"),
  "abalị": require("../../assets/audio/weather-nature/abali.wav"),
  "osisi": require("../../assets/audio/weather-nature/osisi.wav"),
  "akwụkwọ osisi": require("../../assets/audio/weather-nature/akwukwo-osisi.wav"),
  "osimiri": require("../../assets/audio/weather-nature/osimiri.wav"),
  "ugwu": require("../../assets/audio/weather-nature/ugwu.wav"),
  "ọhịa": require("../../assets/audio/weather-nature/ohia.wav"),
  "ala": require("../../assets/audio/weather-nature/ala.wav"),
  "elu igwe": require("../../assets/audio/weather-nature/elu-igwe.wav"),
  "oge": require("../../assets/audio/weather-nature/oge.wav"),
  "oge okpomoku": require("../../assets/audio/weather-nature/oge-okpomoku.wav"),
  "oge mmiri": require("../../assets/audio/weather-nature/oge-mmiri.wav"),
};
