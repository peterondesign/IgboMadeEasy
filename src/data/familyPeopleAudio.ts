export type FamilyPeopleEntry = {
  english: string;
  igbo: string;
};

export const FAMILY_PEOPLE_ENTRIES: FamilyPeopleEntry[] = [
  { english: "Father", igbo: "nna" },
  { english: "Mother", igbo: "nne" },
  { english: "Brother", igbo: "nwanne nwoke" },
  { english: "Sister", igbo: "nwanne nwanyi" },
  { english: "Child", igbo: "nwa" },
  { english: "Family", igbo: "ezinulo" },
  { english: "Friend", igbo: "enyi" },
  { english: "Neighbor", igbo: "onye agbata obi" },
  { english: "Teacher", igbo: "onye nkuzi" },
  { english: "People", igbo: "ndi mmadu" }
];

export const FAMILY_PEOPLE_AUDIO: Record<string, number> = {};
