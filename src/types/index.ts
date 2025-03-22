// Common types used throughout the application

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  identity_number?: string;
  birth_date?: string;
  profile_picture?: string;
  [key: string]: string | boolean | number | null | undefined;
}
