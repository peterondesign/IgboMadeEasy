export type CelebrationsEntry = {
  english: string;
  igbo: string;
};

export const CELEBRATIONS_ENTRIES: CelebrationsEntry[] = [
  { english: "Celebration", igbo: "emume" },
  { english: "Festival", igbo: "oriri" },
  { english: "Wedding", igbo: "agbamakwukwo di na nwunye" },
  { english: "Birthday", igbo: "ụbọchị ọmụmụ" },
  { english: "Child naming", igbo: "ịgụ aha nwa" },
  { english: "New yam festival", igbo: "iri ji ọhụrụ" },
  { english: "Dance", igbo: "egwú" },
  { english: "Song", igbo: "abụ" },
  { english: "Drum", igbo: "ịgba" },
  { english: "Masquerade", igbo: "mmanwụ" },
  { english: "Palm wine", igbo: "nkwu elu" },
  { english: "Food", igbo: "nri" },
  { english: "Guest", igbo: "onye ọbịa" },
  { english: "Gift", igbo: "onyinye" },
  { english: "Prayer", igbo: "ekpere" },
  { english: "Family gathering", igbo: "nzukọ ezinụlọ" },
  { english: "Joy", igbo: "anụrị" },
  { english: "Laughter", igbo: "ọchị" },
  { english: "Blessing", igbo: "ngọzi" },
  { english: "Thanksgiving", igbo: "ikele" },
];

export const CELEBRATIONS_AUDIO: Record<string, number> = {
  "emume": require("../../assets/audio/celebrations/emume.wav"),
  "oriri": require("../../assets/audio/celebrations/oriri.wav"),
  "agbamakwukwo di na nwunye": require("../../assets/audio/celebrations/agbamakwukwo-di-na-nwunye.wav"),
  "ụbọchị ọmụmụ": require("../../assets/audio/celebrations/ubochi-omumu.wav"),
  "ịgụ aha nwa": require("../../assets/audio/celebrations/igu-aha-nwa.wav"),
  "iri ji ọhụrụ": require("../../assets/audio/celebrations/iri-ji-ohuru.wav"),
  "egwú": require("../../assets/audio/celebrations/egwu.wav"),
  "abụ": require("../../assets/audio/celebrations/abu.wav"),
  "ịgba": require("../../assets/audio/celebrations/igba.wav"),
  "mmanwụ": require("../../assets/audio/celebrations/mmanwu.wav"),
  "nkwu elu": require("../../assets/audio/celebrations/nkwu-elu.wav"),
  "nri": require("../../assets/audio/celebrations/nri.wav"),
  "onye ọbịa": require("../../assets/audio/celebrations/onye-obia.wav"),
  "onyinye": require("../../assets/audio/celebrations/onyinye.wav"),
  "ekpere": require("../../assets/audio/celebrations/ekpere.wav"),
  "nzukọ ezinụlọ": require("../../assets/audio/celebrations/nzuko-ezinulo.wav"),
  "anụrị": require("../../assets/audio/celebrations/anuri.wav"),
  "ọchị": require("../../assets/audio/celebrations/ochi.wav"),
  "ngọzi": require("../../assets/audio/celebrations/ngozi.wav"),
  "ikele": require("../../assets/audio/celebrations/ikele.wav"),
};
