export type TransportationEntry = {
  english: string;
  igbo: string;
};

export const TRANSPORTATION_ENTRIES: TransportationEntry[] = [
  { english: "Road", igbo: "ụzọ" },
  { english: "Car", igbo: "ụgbọ ala" },
  { english: "Bus", igbo: "ụgbọ njem" },
  { english: "Motorcycle", igbo: "ọkàdà" },
  { english: "Bicycle", igbo: "igwe kwu otu" },
  { english: "Taxi", igbo: "taxi" },
  { english: "Driver", igbo: "onye na-anya ụgbọ ala" },
  { english: "Passenger", igbo: "onye njem" },
  { english: "Park", igbo: "ogige ụgbọ ala" },
  { english: "Stop", igbo: "kwụsị" },
  { english: "Go", igbo: "gaa" },
  { english: "Turn left", igbo: "tụọ aka ekpe" },
  { english: "Turn right", igbo: "tụọ aka nri" },
  { english: "Bridge", igbo: "akwa mmiri" },
  { english: "Traffic", igbo: "okporo ụzọ jupụtara" },
  { english: "Fuel", igbo: "mmanụ ụgbọ ala" },
  { english: "Journey", igbo: "njem" },
  { english: "Near", igbo: "nso" },
  { english: "Far", igbo: "anya" },
  { english: "Arrive", igbo: "ruo" },
];

export const TRANSPORTATION_AUDIO: Record<string, number> = {
  "ụzọ": require("../../assets/audio/transportation/uzo.wav"),
  "ụgbọ ala": require("../../assets/audio/transportation/ugbo-ala.wav"),
  "ụgbọ njem": require("../../assets/audio/transportation/ugbo-njem.wav"),
  "ọkàdà": require("../../assets/audio/transportation/okada.wav"),
  "igwe kwu otu": require("../../assets/audio/transportation/igwe-kwu-otu.wav"),
  "taxi": require("../../assets/audio/transportation/taxi.wav"),
  "onye na-anya ụgbọ ala": require("../../assets/audio/transportation/onye-na-anya-ugbo-ala.wav"),
  "onye njem": require("../../assets/audio/transportation/onye-njem.wav"),
  "ogige ụgbọ ala": require("../../assets/audio/transportation/ogige-ugbo-ala.wav"),
  "kwụsị": require("../../assets/audio/transportation/kwusi.wav"),
  "gaa": require("../../assets/audio/transportation/gaa.wav"),
  "tụọ aka ekpe": require("../../assets/audio/transportation/tuo-aka-ekpe.wav"),
  "tụọ aka nri": require("../../assets/audio/transportation/tuo-aka-nri.wav"),
  "akwa mmiri": require("../../assets/audio/transportation/akwa-mmiri.wav"),
  "okporo ụzọ jupụtara": require("../../assets/audio/transportation/okporo-uzo-juputara.wav"),
  "mmanụ ụgbọ ala": require("../../assets/audio/transportation/mmanu-ugbo-ala.wav"),
  "njem": require("../../assets/audio/transportation/njem.wav"),
  "nso": require("../../assets/audio/transportation/nso.wav"),
  "anya": require("../../assets/audio/transportation/anya.wav"),
  "ruo": require("../../assets/audio/transportation/ruo.wav"),
};
