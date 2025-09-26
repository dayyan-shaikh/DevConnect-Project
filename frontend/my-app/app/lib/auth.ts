// Check if we're running in the browser
const isBrowser = typeof window !== 'undefined';

// Authentication utility functions
export const logout = () => {
  if (!isBrowser) return;
  localStorage.removeItem("access_token");
  // Force a page reload to trigger route protection
  window.location.href = "/";
};

export const isAuthenticated = (): boolean => {
  if (!isBrowser) return false;
  return !!localStorage.getItem("access_token");
};

export const getToken = (): string | null => {
  if (!isBrowser) return null;
  return localStorage.getItem("access_token");
};

export const getCurrentUserId = (): string | null => {
  if (!isBrowser) return null;
  
  // Try multiple methods to get user ID
  console.log('getCurrentUserId - starting...');
  
  // Method 1: From JWT token
  const token = getToken();
  console.log('getCurrentUserId - token:', token ? 'exists' : 'null');
  
  if (token) {
  try {
    // Decode JWT token to get user ID
    const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('getCurrentUserId - decoded payload:', payload);
      const userId = payload.sub || payload.userId || payload.id || null;
      console.log('getCurrentUserId - extracted userId from token:', userId);
      if (userId) return userId;
  } catch (error) {
    console.error('Error decoding token:', error);
    }
  }
  
  // Method 2: From localStorage directly (fallback)
  const storedUserId = localStorage.getItem('user_id');
  console.log('getCurrentUserId - stored user_id:', storedUserId);
  if (storedUserId) return storedUserId;
  
  // Method 3: From user object in localStorage
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      console.log('getCurrentUserId - user object:', user);
      const userId = user.user_id || user.id || user.sub || null;
      console.log('getCurrentUserId - extracted userId from user object:', userId);
      if (userId) return userId;
    } catch (error) {
      console.error('Error parsing user object:', error);
    }
  }
  
  console.log('getCurrentUserId - no user ID found');
  return null;
};
