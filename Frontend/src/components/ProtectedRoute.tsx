import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * ProtectedRoute component for role-based access control
 * 
 * Usage:
 * - Wrap any route that requires authentication
 * - Specify allowedRoles to restrict access to specific user types
 * - If no roles specified, only checks for authentication
 */
export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-8 w-1/2 mx-auto" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role-based access (server returns roles as array)
  if (allowedRoles && user && !user.roles.some(r => allowedRoles.includes(r))) {
    const roleRedirects: Record<UserRole, string> = {
      student: "/student-dashboard",
      parent: "/parent-dashboard",
      teacher: "/teacher-dashboard",
      mentor: "/teacher-dashboard",
      admin: "/admin",
    };

    const primaryRole = user.roles[0];
    const targetRedirect = redirectTo || (primaryRole && roleRedirects[primaryRole]) || "/";

    return <Navigate to={targetRedirect} replace />;
  }

  return <>{children}</>;
};

/**
 * Component to show when access is denied
 */
export const AccessDenied = () => {
  const { user } = useAuth();
  
  const roleRedirects: Record<UserRole, string> = {
    student: "/student-dashboard",
    parent: "/parent-dashboard",
    teacher: "/teacher-dashboard",
    mentor: "/teacher-dashboard",
    admin: "/admin",
  };

  const primaryRole = user?.roles[0];
  const dashboardUrl = primaryRole ? roleRedirects[primaryRole] : "/login";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2">Không có quyền truy cập</h1>
        <p className="text-muted-foreground mb-6">
          Bạn không có quyền truy cập trang này.
        </p>
        <a
          href={dashboardUrl}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Quay lại Dashboard
        </a>
      </div>
    </div>
  );
};

export default ProtectedRoute;

