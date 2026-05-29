export type AnimalsEntry = {
  english: string;
  igbo: string;
};

export const ANIMALS_ENTRIES: AnimalsEntry[] = [
  { english: "Animal", igbo: "anụmanụ" },
  { english: "Dog", igbo: "nkịta" },
  { english: "Cat", igbo: "pụsị" },
  { english: "Goat", igbo: "ewu" },
  { english: "Cow", igbo: "ehi" },
  { english: "Chicken", igbo: "ọkụkọ" },
  { english: "Bird", igbo: "nnụnụ" },
  { english: "Fish", igbo: "azụ" },
  { english: "Monkey", igbo: "enwe" },
  { english: "Lion", igbo: "ọdụm" },
  { english: "Elephant", igbo: "enyin" },
  { english: "Snake", igbo: "agwọ" },
  { english: "Lizard", igbo: "ngwere" },
  { english: "Rat", igbo: "oke" },
  { english: "Rabbit", igbo: "oke oyibo" },
  { english: "Duck", igbo: "nza mmiri" },
  { english: "Egg", igbo: "àkwá ọkụkọ" },
  { english: "Tail", igbo: "ọdụ" },
  { english: "Horn", igbo: "mpi" },
  { english: "Wild animal", igbo: "anụmanụ ọhịa" },
];

export const ANIMALS_AUDIO: Record<string, number> = {
  "anụmanụ": require("../../assets/audio/animals/anumanu.wav"),
  "nkịta": require("../../assets/audio/animals/nkita.wav"),
  "pụsị": require("../../assets/audio/animals/pusi.wav"),
  "ewu": require("../../assets/audio/animals/ewu.wav"),
  "ehi": require("../../assets/audio/animals/ehi.wav"),
  "ọkụkọ": require("../../assets/audio/animals/okuko.wav"),
  "nnụnụ": require("../../assets/audio/animals/nnunu.wav"),
  "azụ": require("../../assets/audio/animals/azu.wav"),
  "enwe": require("../../assets/audio/animals/enwe.wav"),
  "ọdụm": require("../../assets/audio/animals/odum.wav"),
  "enyin": require("../../assets/audio/animals/enyin.wav"),
  "agwọ": require("../../assets/audio/animals/agwo.wav"),
  "ngwere": require("../../assets/audio/animals/ngwere.wav"),
  "oke": require("../../assets/audio/animals/oke.wav"),
  "oke oyibo": require("../../assets/audio/animals/oke-oyibo.wav"),
  "nza mmiri": require("../../assets/audio/animals/nza-mmiri.wav"),
  "àkwá ọkụkọ": require("../../assets/audio/animals/akwa-okuko.wav"),
  "ọdụ": require("../../assets/audio/animals/odu.wav"),
  "mpi": require("../../assets/audio/animals/mpi.wav"),
  "anụmanụ ọhịa": require("../../assets/audio/animals/anumanu-ohia.wav"),
};
