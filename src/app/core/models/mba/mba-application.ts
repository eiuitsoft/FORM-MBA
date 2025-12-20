export interface MBAApplication {
  id?: string;
  personalDetails: PersonalDetails;
  applicationDetails: ApplicationDetails;
  educationDetails: EducationDetails;
  englishQualifications: EnglishQualifications;
  employmentHistory: EmploymentHistory;
  declaration: Declaration;
}

export interface PersonalDetails {
  fullName: string;
  nationalityId?: string;
  nationalityName?: string;
  gender: number; // 0: Female, 1: Male
  dateOfBirth: string;
  placeOfBirth: string;
  passportNo: string;
  dateIssued: string;
  email: string;
  mobile: string;
  jobTitle?: string;
  organization?: string;
  correspondenceAddress: string;
  permanentAddress: string;
}

export interface ApplicationDetails {
  programId: string;
  programName?: string;
  programCode?: string;
  track: number; // 0: Application, 1: Research
  admissionYear: number;
  admissionIntake?: string;
}

export interface EducationDetails {
  undergraduate: EducationRecord;
  secondDegree?: EducationRecord;
  postgraduate?: PostgraduateRecord;
}

export interface EducationRecord {
  university: string;
  countryId?: string;
  countryName?: string;
  major: string;
  graduationYear: number;
  languageId?: string;
  languageName?: string;
  thesisTitle?: string;
}

export interface PostgraduateRecord extends EducationRecord {}

export interface EnglishQualifications {
  ielts?: TestScore;
  toefl?: TestScore;
  other?: OtherTest;
}

export interface TestScore {
  name?: string;
  score?: string;
  date?: string;
}

export interface OtherTest extends TestScore {}

export interface EmploymentHistory {
  position1: EmploymentRecord;
  position2?: EmploymentRecord;
}

export interface EmploymentRecord {
  organization: string;
  title: string;
  fromDate: string;
  toDate: string;
  address: string;
}

export interface Declaration {
  agreed: boolean;
}
