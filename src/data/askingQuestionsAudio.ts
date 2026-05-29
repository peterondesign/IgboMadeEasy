export type AskingQuestionEntry = {
  english: string;
  igbo: string;
};

export const ASKING_QUESTIONS_ENTRIES: AskingQuestionEntry[] = [
  { english: "What is your name?", igbo: "gini bu aha gi" },
  { english: "Where are you going?", igbo: "ebee ka i na-aga" },
  { english: "Who is that?", igbo: "onye bu onye ahu" },
  { english: "Why are you crying?", igbo: "gini mere i ji akwa" },
  { english: "When will you come?", igbo: "mgbe ole ka i ga-abia" },
  { english: "How much is this?", igbo: "ego ole ka nke a bu" },
  { english: "Do you understand?", igbo: "i ghota" },
  { english: "Can you help me?", igbo: "i nwere ike inyere m aka" },
  { english: "Is this correct?", igbo: "nke a ziri ezi" },
  { english: "What happened?", igbo: "gini mere" }
];

export const ASKING_QUESTIONS_AUDIO: Record<string, number> = {};
