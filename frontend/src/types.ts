export type HigherEducation = {
  year: number;
  university: string;
  major: string;
};

export type Course = {
  year: number;
  name: string;
  certificate: string;
  certificateURL: string;
};

export type Position = {
  period: string;
  position: string;
};

export type ProfessionalDevelopment = {
  name: string;
  certificate: string;
  certificateURL: string;
};

export type UserPreview = {
  name: string;
  photoURL: string;
};

export type LinkWithPicture = {
  title: string;
  url: string;
  pictureURL: string;
};

export type User = {
  id: string;
  username: string;
  lastName: string;
  firstName: string;
  patronym: string;
  email: string;
  status: string;
  dateOfBirth: string;
  phone: string;
  position: string;
  serviceRank: string;
  structuralUnit: string;
  territorialBody: string;
  about: string;
  skills: string;
  career: Position[];
  workExperience: string;
  professionalDevelopments: ProfessionalDevelopment[];
  photoURL: string;
  higherEducation: HigherEducation[];
  courses: Course[];
  communityWork: LinkWithPicture[];
  awards: LinkWithPicture[];
  colleagues: string[];
  bosses: string[];
};
