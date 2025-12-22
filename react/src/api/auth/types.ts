export interface Auth {
  userId: string;
  email: string;
  token: string;
  isAdmin: boolean;
  groups: string[];
  isLoggedIn: boolean;
  orgId: number | null;
}
