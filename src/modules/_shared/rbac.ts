export type RoleName = 'Super Admin' | 'Admin' | 'Manager' | 'Chef' | 'Waiter';

export const allowAdminAndSuperAdmin: RoleName[] = ['Admin', 'Super Admin'];
export const allowAllPrivileged: RoleName[] = ['Admin', 'Super Admin', 'Chef', 'Waiter'];
export const allowAllStaff: RoleName[] = ['Admin', 'Manager', 'Super Admin', 'Chef', 'Waiter'];
export const allowChefOnly: RoleName[] = ['Chef'];
export const allowWaiterOnly: RoleName[] = ['Waiter'];
export const allowAdminManagerAndSuperAdmin: RoleName[] = ['Admin', 'Manager', 'Super Admin'];
export const allowAdminChefWaiter: RoleName[] = ['Admin', 'Chef', 'Waiter'];
export const allowAdminAndManager: RoleName[] = ['Admin', 'Manager'];
