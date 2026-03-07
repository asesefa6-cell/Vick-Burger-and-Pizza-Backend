export type RoleName = 'Super Admin' | 'Admin' | 'Manager' | 'Chef' | 'Waiter';

export interface JwtPayload {
  userId: string;
  role: RoleName;
  businessId?: string | null;
}
