export const API = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodGroup = (typeof GROUPS)[number];

export type Donor = {
  _id: string;
  name: string;
  age: number;
  mobileNo: string;
  sex: "male" | "female" | "other";
  bloodGroup: BloodGroup;
  currentLocation: string;
};
export type DonorList = {
  success: boolean;
  data: Donor[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  message?: string;
};
export type Stats = { total: number; byBloodGroup: Record<BloodGroup, number> };
