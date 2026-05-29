export type AskingQuestionEntry = {
  english: string;
  igbo: string;
};

export const ASKING_QUESTIONS_ENTRIES: AskingQuestionEntry[] = [
  { english: "What is your name?", igbo: "gịnị bụ aha gị" },
  { english: "Where are you going?", igbo: "ebee ka ị na-aga" },
  { english: "Who is that?", igbo: "onye bụ onye ahụ" },
  { english: "Why are you crying?", igbo: "gini mere i ji akwa" },
  { english: "When will you come?", igbo: "mgbe ole ka ị ga-abịa" },
  { english: "How much is this?", igbo: "ego ole ka nke a bụ" },
  { english: "Do you understand?", igbo: "i ghota" },
  { english: "Can you help me?", igbo: "ị nwere ike inyere m aka" },
  { english: "Is this correct?", igbo: "nke a ziri ezi?" },
  { english: "What happened?", igbo: "gịnị mere?" },
];

export const ASKING_QUESTIONS_AUDIO: Record<string, number> = {
  "gịnị bụ aha gị": require("../../assets/audio/asking-questions/gini-bu-aha-gi.wav"),
  "ebee ka ị na-aga": require("../../assets/audio/asking-questions/ebee-ka-i-na-aga.wav"),
  "onye bụ onye ahụ": require("../../assets/audio/asking-questions/onye-bu-onye-ahu.wav"),
  "gini mere i ji akwa": require("../../assets/audio/asking-questions/gini-mere-i-ji-akwa.wav"),
  "mgbe ole ka ị ga-abịa": require("../../assets/audio/asking-questions/mgbe-ole-ka-i-ga-abia.wav"),
  "ego ole ka nke a bụ": require("../../assets/audio/asking-questions/ego-ole-ka-nke-a-bu.wav"),
  "i ghota": require("../../assets/audio/asking-questions/i-ghota.wav"),
  "ị nwere ike inyere m aka": require("../../assets/audio/asking-questions/i-nwere-ike-inyere-m-aka.wav"),
  "nke a ziri ezi?": require("../../assets/audio/asking-questions/nke-a-ziri-ezi.wav"),
  "gịnị mere?": require("../../assets/audio/asking-questions/gini-mere.wav"),
};
