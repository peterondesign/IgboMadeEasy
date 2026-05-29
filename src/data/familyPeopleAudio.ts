export type FamilyPeopleEntry = {
  english: string;
  igbo: string;
};

export const FAMILY_PEOPLE_ENTRIES: FamilyPeopleEntry[] = [
  { english: "Father", igbo: "nna" },
  { english: "Mother", igbo: "nne" },
  { english: "Brother", igbo: "nwanne nwoke" },
  { english: "Sister", igbo: "nwanne nwanyị" },
  { english: "Child", igbo: "nwa" },
  { english: "Family", igbo: "ezinụlọ" },
  { english: "Friend", igbo: "enyi" },
  { english: "Neighbor", igbo: "onye agbata obi" },
  { english: "Teacher", igbo: "onye nkuzi" },
  { english: "People", igbo: "ndị mmadụ" },
];

export const FAMILY_PEOPLE_AUDIO: Record<string, number> = {
  "nna": require("../../assets/audio/family-people/nna.wav"),
  "nne": require("../../assets/audio/family-people/nne.wav"),
  "nwanne nwoke": require("../../assets/audio/family-people/nwanne-nwoke.wav"),
  "nwanne nwanyị": require("../../assets/audio/family-people/nwanne-nwanyi.wav"),
  "nwa": require("../../assets/audio/family-people/nwa.wav"),
  "ezinụlọ": require("../../assets/audio/family-people/ezinulo.wav"),
  "enyi": require("../../assets/audio/family-people/enyi.wav"),
  "onye agbata obi": require("../../assets/audio/family-people/onye-agbata-obi.wav"),
  "onye nkuzi": require("../../assets/audio/family-people/onye-nkuzi.wav"),
  "ndị mmadụ": require("../../assets/audio/family-people/ndi-mmadu.wav"),
};
