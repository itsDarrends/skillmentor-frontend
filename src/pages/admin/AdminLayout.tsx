import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router";
import { LayoutDashboard, Users, BookOpen, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!authLoaded || !userLoaded) return;
    if (!isSignedIn) {
      navigate("/login");
      return;
    }
    const roles = user?.publicMetadata?.roles as string[] | undefined;
    if (!roles?.includes("ADMIN")) {
      navigate("/dashboard");
      return;
    }
    setChecked(true);
  }, [authLoaded, userLoaded, isSignedIn, user, navigate]);

  if (!checked) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );

  const navItems = [
    { label: "Manage Bookings", href: "/admin/bookings", icon: LayoutDashboard },
    { label: "Create Mentor", href: "/admin/mentors/create", icon: Users },
    { label: "Create Subject", href: "/admin/subjects/create", icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 bg-black text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center space-x-2">
            <Menu className="size-5" />
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-white/60 hover:text-white text-sm transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}