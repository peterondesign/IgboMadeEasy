export type TransportationEntry = {
  english: string;
  igbo: string;
};

export const TRANSPORTATION_ENTRIES: TransportationEntry[] = [
  { english: "Road", igbo: "uzo" },
  { english: "Car", igbo: "ugbo ala" },
  { english: "Bus", igbo: "ugbo njem" },
  { english: "Motorcycle", igbo: "okada" },
  { english: "Bicycle", igbo: "igwe kwu otu" },
  { english: "Taxi", igbo: "taxi" },
  { english: "Driver", igbo: "onye na-anya ugbo ala" },
  { english: "Passenger", igbo: "onye njem" },
  { english: "Park", igbo: "ogige ugbo ala" },
  { english: "Stop", igbo: "kwusi" },
  { english: "Go", igbo: "gaa" },
  { english: "Turn left", igbo: "tuo aka ekpe" },
  { english: "Turn right", igbo: "tuo aka nri" },
  { english: "Bridge", igbo: "akwa mmiri" },
  { english: "Traffic", igbo: "okporo uzo juputara" },
  { english: "Fuel", igbo: "mmanu ugbo ala" },
  { english: "Journey", igbo: "njem" },
  { english: "Near", igbo: "nso" },
  { english: "Far", igbo: "anya" },
  { english: "Arrive", igbo: "ruo" }
];

export const TRANSPORTATION_AUDIO: Record<string, number> = {};
