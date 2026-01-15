import { ChangeData } from 'ngx-intl-tel-input';

export interface MBAApplication {
  personalDetails: PersonalDetails;
  applicationDetails: ApplicationDetails;
  educationDetails: EducationDetails;
  englishQualifications: EnglishQualifications;
  employmentHistory: EmploymentHistory;
  declaration: Declaration;
}

export interface MBAApplicationDetail extends MBAApplication {
  id: string;
  statusId: number;
  statusName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalDetails {
  id?: string;
  fullName: string;
  nationalityId?: string;
  nationalityName?: string;
  gender: number; // 1: Male, 2: Female
  dateOfBirth: string;
  placeOfBirth: string;
  passportNo: string;
  dateIssued: string;
  passportPlaceIssued: string;
  email: string;
  mobile: string | ChangeData;
  jobTitle?: string;
  organization?: string;
  profileCode?: string;
  correspondenceCityId?: number;
  correspondenceCityName?: string;
  correspondenceDistrictId?: number;
  correspondenceDistrictName?: string;
  correspondenceAddress: string;
  permanentCityId?: number;
  permanentCityName?: string;
  permanentDistrictId?: number;
  permanentDistrictName?: string;
  permanentAddress: string;
  uploadedFiles?: UploadedFile[];
}

export interface UploadedFile {
  id?: number;
  fileOriginalName: string;
  fileFullPath: string;
  fileExtension: string;
  fileSize: number;
  fileCategoryId: number;
  fileCategoryName?: string;
  statusFile?: number;
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
  undergraduates: EducationRecord[];
  postgraduates?: EducationRecord[];
}

export interface EducationRecord {
  id?: string;
  university: string;
  countryId?: string;
  countryName?: string;
  major: string;
  graduationYear: number;
  gpa: string;
  graduationRank?: string;
  languageId?: string;
  languageName?: string;
  sortOrder?: number;
  thesisTitle?: string;
}

export interface EnglishQualifications {
  ielts?: TestScore;
  toefl?: TestScore;
  other?: TestScore;
}

export interface TestScore {
  id?: string;
  name?: string;
  score?: string;
  date?: string;
}

export interface EmploymentHistory {
  totalExpYears: number;
  totalExpMonths: number;
  position1: EmploymentRecord;
  position2?: EmploymentRecord;
}

export interface EmploymentRecord {
  id?: string;
  organizationName: string;
  jobTitle: string;
  fromDate: string;
  toDate: string;
  address: string;
}

export interface Declaration {
  agreed: boolean;
}
