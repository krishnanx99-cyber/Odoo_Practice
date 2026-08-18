export type UserRole = "student" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

let currentUser: SessionUser | null = null;

export function isAuthenticated(): boolean {
  return currentUser !== null;
}

export function getCurrentUser(): SessionUser | null {
  return currentUser;
}

export function setSessionUser(user: SessionUser | null): void {
  currentUser = user;
}