export type EldersEntry = {
  english: string;
  igbo: string;
};

export const ELDERS_ENTRIES: EldersEntry[] = [
  { english: "Elder", igbo: "okenye" },
  { english: "Grandfather", igbo: "nna ochie" },
  { english: "Grandmother", igbo: "nne ochie" },
  { english: "Old man", igbo: "okenye nwoke" },
  { english: "Old woman", igbo: "okenye nwanyị" },
  { english: "Respect", igbo: "nsọpụrụ" },
  { english: "Blessing", igbo: "ngọzi" },
  { english: "Wisdom", igbo: "amamihe" },
  { english: "Advice", igbo: "ndụmọdụ" },
  { english: "Listen", igbo: "gee ntị" },
  { english: "Greet", igbo: "kele" },
  { english: "Kneel", igbo: "gbuo ikpere" },
  { english: "Tradition", igbo: "omenala" },
  { english: "Clan", igbo: "ụmụnna" },
  { english: "Kindred", igbo: "obodo nna" },
  { english: "Title", igbo: "aha ọgọ" },
  { english: "Council", igbo: "ndị ichie" },
  { english: "Story", igbo: "akụkọ" },
  { english: "Ancestor", igbo: "nna nna ochie" },
  { english: "Honor", igbo: "nye ugwu" },
];

export const ELDERS_AUDIO: Record<string, number> = {
  "okenye": require("../../assets/audio/elders/okenye.wav"),
  "nna ochie": require("../../assets/audio/elders/nna-ochie.wav"),
  "nne ochie": require("../../assets/audio/elders/nne-ochie.wav"),
  "okenye nwoke": require("../../assets/audio/elders/okenye-nwoke.wav"),
  "okenye nwanyị": require("../../assets/audio/elders/okenye-nwanyi.wav"),
  "nsọpụrụ": require("../../assets/audio/elders/nsopuru.wav"),
  "ngọzi": require("../../assets/audio/elders/ngozi.wav"),
  "amamihe": require("../../assets/audio/elders/amamihe.wav"),
  "ndụmọdụ": require("../../assets/audio/elders/ndumodu.wav"),
  "gee ntị": require("../../assets/audio/elders/gee-nti.wav"),
  "kele": require("../../assets/audio/elders/kele.wav"),
  "gbuo ikpere": require("../../assets/audio/elders/gbuo-ikpere.wav"),
  "omenala": require("../../assets/audio/elders/omenala.wav"),
  "ụmụnna": require("../../assets/audio/elders/umunna.wav"),
  "obodo nna": require("../../assets/audio/elders/obodo-nna.wav"),
  "aha ọgọ": require("../../assets/audio/elders/aha-ogo.wav"),
  "ndị ichie": require("../../assets/audio/elders/ndi-ichie.wav"),
  "akụkọ": require("../../assets/audio/elders/akuko.wav"),
  "nna nna ochie": require("../../assets/audio/elders/nna-nna-ochie.wav"),
  "nye ugwu": require("../../assets/audio/elders/nye-ugwu.wav"),
};
