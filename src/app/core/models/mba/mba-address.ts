export interface City {
  id: string;
  cityCode: string;
  cityName: string;
  sortOrder: number;
}

export interface District {
  cityDistricId: number;
  distinctCode: string;
  distinctName: string;
}
