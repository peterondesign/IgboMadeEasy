export type NumbersMoneyEntry = {
  english: string;
  igbo: string;
};

export const NUMBERS_MONEY_ENTRIES: NumbersMoneyEntry[] = [
  { english: "One", igbo: "otu" },
  { english: "Two", igbo: "abụọ" },
  { english: "Three", igbo: "atọ" },
  { english: "Four", igbo: "anọ" },
  { english: "Five", igbo: "ise" },
  { english: "Six", igbo: "isii" },
  { english: "Seven", igbo: "asaa" },
  { english: "Eight", igbo: "asatọ" },
  { english: "Nine", igbo: "itoolu" },
  { english: "Ten", igbo: "iri" },
  { english: "Money", igbo: "ego" },
  { english: "Price", igbo: "ahịa" },
  { english: "How much?", igbo: "ego ole?" },
  { english: "Cheap", igbo: "dika ala" },
  { english: "Expensive", igbo: "dika elu" },
  { english: "Market", igbo: "ahịa ukwu" },
  { english: "Coin", igbo: "ego mkpuru" },
  { english: "Note", igbo: "ego akwụkwọ" },
  { english: "Change", igbo: "ego fọdụrụ" },
  { english: "Pay", igbo: "kwụọ ụgwọ" },
];

export const NUMBERS_MONEY_AUDIO: Record<string, number> = {
  "otu": require("../../assets/audio/numbers-money/otu.wav"),
  "abụọ": require("../../assets/audio/numbers-money/abuo.wav"),
  "atọ": require("../../assets/audio/numbers-money/ato.wav"),
  "anọ": require("../../assets/audio/numbers-money/ano.wav"),
  "ise": require("../../assets/audio/numbers-money/ise.wav"),
  "isii": require("../../assets/audio/numbers-money/isii.wav"),
  "asaa": require("../../assets/audio/numbers-money/asaa.wav"),
  "asatọ": require("../../assets/audio/numbers-money/asato.wav"),
  "itoolu": require("../../assets/audio/numbers-money/itoolu.wav"),
  "iri": require("../../assets/audio/numbers-money/iri.wav"),
  "ego": require("../../assets/audio/numbers-money/ego.wav"),
  "ahịa": require("../../assets/audio/numbers-money/ahia.wav"),
  "ego ole?": require("../../assets/audio/numbers-money/ego-ole.wav"),
  "dika ala": require("../../assets/audio/numbers-money/dika-ala.wav"),
  "dika elu": require("../../assets/audio/numbers-money/dika-elu.wav"),
  "ahịa ukwu": require("../../assets/audio/numbers-money/ahia-ukwu.wav"),
  "ego mkpuru": require("../../assets/audio/numbers-money/ego-mkpuru.wav"),
  "ego akwụkwọ": require("../../assets/audio/numbers-money/ego-akwukwo.wav"),
  "ego fọdụrụ": require("../../assets/audio/numbers-money/ego-foduru.wav"),
  "kwụọ ụgwọ": require("../../assets/audio/numbers-money/kwuo-ugwo.wav"),
};
