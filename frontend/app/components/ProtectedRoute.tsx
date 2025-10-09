import { useEffect, useState } from "react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true = requires authentication, false = requires no authentication
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo 
}: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If route requires authentication and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo || "/login"} replace />;
  }

  // If route requires NO authentication (login/register) and user IS authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to={redirectTo || "/home"} replace />;
  }

  return <>{children}</>;
}

// Convenience components for specific use cases
export function AuthenticatedRoute({ children, redirectTo = "/home" }: { 
  children: React.ReactNode; 
  redirectTo?: string; 
}) {
  return (
    <ProtectedRoute requireAuth={true} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}

export function UnauthenticatedRoute({ children, redirectTo = "/home" }: { 
  children: React.ReactNode; 
  redirectTo?: string; 
}) {
  return (
    <ProtectedRoute requireAuth={false} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
}
