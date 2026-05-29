export type SchoolWorkEntry = {
  english: string;
  igbo: string;
};

export const SCHOOL_WORK_ENTRIES: SchoolWorkEntry[] = [
  { english: "School", igbo: "ụlọ akwụkwọ" },
  { english: "Class", igbo: "klaasị" },
  { english: "Teacher", igbo: "onye nkuzi" },
  { english: "Student", igbo: "nwata akwụkwọ" },
  { english: "Book", igbo: "akwụkwọ" },
  { english: "Pen", igbo: "mkpịsị ide" },
  { english: "Read", igbo: "gụọ" },
  { english: "Write", igbo: "dee" },
  { english: "Homework", igbo: "ọrụ ụlọ" },
  { english: "Exam", igbo: "ule" },
  { english: "Work", igbo: "ọrụ" },
  { english: "Office", igbo: "ụlọ ọrụ" },
  { english: "Boss", igbo: "onye isi" },
  { english: "Colleague", igbo: "onye ọrụ ibe" },
  { english: "Meeting", igbo: "nzukọ" },
  { english: "Salary", igbo: "ụgwọ ọrụ" },
  { english: "Break", igbo: "izu ike" },
  { english: "Computer", igbo: "kọmputa" },
  { english: "Learn", igbo: "mụta" },
  { english: "Teach", igbo: "kuzi" },
];

export const SCHOOL_WORK_AUDIO: Record<string, number> = {
  "ụlọ akwụkwọ": require("../../assets/audio/school-work/ulo-akwukwo.wav"),
  "klaasị": require("../../assets/audio/school-work/klaasi.wav"),
  "onye nkuzi": require("../../assets/audio/school-work/onye-nkuzi.wav"),
  "nwata akwụkwọ": require("../../assets/audio/school-work/nwata-akwukwo.wav"),
  "akwụkwọ": require("../../assets/audio/school-work/akwukwo.wav"),
  "mkpịsị ide": require("../../assets/audio/school-work/mkpisi-ide.wav"),
  "gụọ": require("../../assets/audio/school-work/guo.wav"),
  "dee": require("../../assets/audio/school-work/dee.wav"),
  "ọrụ ụlọ": require("../../assets/audio/school-work/oru-ulo.wav"),
  "ule": require("../../assets/audio/school-work/ule.wav"),
  "ọrụ": require("../../assets/audio/school-work/oru.wav"),
  "ụlọ ọrụ": require("../../assets/audio/school-work/ulo-oru.wav"),
  "onye isi": require("../../assets/audio/school-work/onye-isi.wav"),
  "onye ọrụ ibe": require("../../assets/audio/school-work/onye-oru-ibe.wav"),
  "nzukọ": require("../../assets/audio/school-work/nzuko.wav"),
  "ụgwọ ọrụ": require("../../assets/audio/school-work/ugwo-oru.wav"),
  "izu ike": require("../../assets/audio/school-work/izu-ike.wav"),
  "kọmputa": require("../../assets/audio/school-work/komputa.wav"),
  "mụta": require("../../assets/audio/school-work/muta.wav"),
  "kuzi": require("../../assets/audio/school-work/kuzi.wav"),
};
