import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminSession } from "@/hooks/use-admin-session";

export default function AdminRoute() {
  const { session, isAdmin, loading } = useAdminSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading admin...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-md border border-border bg-background p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin access required</p>
          <h1 className="mt-3 font-serif text-2xl italic">This account is not allow-listed.</h1>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Ask an existing administrator to add this email to the Supabase admin_users table.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
