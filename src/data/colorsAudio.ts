export type ColorsEntry = {
  english: string;
  igbo: string;
};

export const COLORS_ENTRIES: ColorsEntry[] = [
  { english: "Color", igbo: "agba" },
  { english: "Red", igbo: "uhie" },
  { english: "Blue", igbo: "anụnụ anụnụ" },
  { english: "Green", igbo: "akwụkwọ ndụ" },
  { english: "Yellow", igbo: "odo" },
  { english: "Black", igbo: "ojii" },
  { english: "White", igbo: "ọcha" },
  { english: "Brown", igbo: "nchara" },
  { english: "Orange", igbo: "oroma" },
  { english: "Pink", igbo: "pinki" },
  { english: "Purple", igbo: "pọpụl" },
  { english: "Gray", igbo: "ntụ isi" },
  { english: "Gold", igbo: "ọlaedo" },
  { english: "Silver", igbo: "ọlaọcha" },
  { english: "Dark", igbo: "ọchịchịrị" },
  { english: "Light", igbo: "ìhè" },
  { english: "Bright", igbo: "na-egbuke egbuke" },
  { english: "Colorful", igbo: "agba agba" },
  { english: "Paint", igbo: "tee agba" },
  { english: "Rainbow", igbo: "ụta mmiri" },
];

export const COLORS_AUDIO: Record<string, number> = {
  agba: require("../../assets/audio/colors/agba.wav"),
  uhie: require("../../assets/audio/colors/uhie.wav"),
  "anụnụ anụnụ": require("../../assets/audio/colors/anunu-anunu.wav"),
  "akwụkwọ ndụ": require("../../assets/audio/colors/akwukwo-ndu.wav"),
  odo: require("../../assets/audio/colors/odo.wav"),
  ojii: require("../../assets/audio/colors/ojii.wav"),
  "ọcha": require("../../assets/audio/colors/ocha.wav"),
  nchara: require("../../assets/audio/colors/nchara.wav"),
  oroma: require("../../assets/audio/colors/oroma.wav"),
  pinki: require("../../assets/audio/colors/pinki.wav"),
  "pọpụl": require("../../assets/audio/colors/popul.wav"),
  "ntụ isi": require("../../assets/audio/colors/ntu-isi.wav"),
  "ọlaedo": require("../../assets/audio/colors/olaedo.wav"),
  "ọlaọcha": require("../../assets/audio/colors/olaocha.wav"),
  "ọchịchịrị": require("../../assets/audio/colors/ochichiri.wav"),
  "ìhè": require("../../assets/audio/colors/ihe.wav"),
  "na-egbuke egbuke": require("../../assets/audio/colors/na-egbuke-egbuke.wav"),
  "agba agba": require("../../assets/audio/colors/agba-agba.wav"),
  "tee agba": require("../../assets/audio/colors/tee-agba.wav"),
  "ụta mmiri": require("../../assets/audio/colors/uta-mmiri.wav"),
};
