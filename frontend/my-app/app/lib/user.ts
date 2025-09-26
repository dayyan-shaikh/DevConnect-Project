// Utility functions for user authentication and profile management
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  sub: string; // user_id
  email: string;
  iat?: number;
  exp?: number;
}

export const getCurrentUser = (): JWTPayload | null => {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    
    const decoded = jwtDecode<JWTPayload>(token);
    return decoded;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export const getCurrentUserId = (): string | null => {
  const user = getCurrentUser();
  return user?.sub || null;
};
