export interface Organization {
  id: number;
  name: string;
  address: string;
  units: {
    id: number;
    name: string;
  }[];
}
