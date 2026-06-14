import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Header from "../components/headers";

const AppLayout = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.unsafeMetadata?.role;
      if (!role && location.pathname !== "/onboarding") {
        navigate("/onboarding");
      } else if (role && location.pathname === "/onboarding") {
        navigate("/jobs");
      }
    }
  }, [user, isLoaded, location.pathname, navigate]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0c] text-foreground selection:bg-purple-500/30 selection:text-purple-200">
      <div className="grid-layout" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="container mx-auto flex-1 px-6 py-8 md:py-12">
          <Outlet />
        </main>

        <footer className="border-t border-white/5 bg-[#0e0e11]/50 py-8 backdrop-blur-sm">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 sm:flex-row text-sm text-muted-foreground">
            <div>
              &copy; {new Date().getFullYear()}{" "}
              <span className="font-semibold text-foreground">hirrd</span>. All
              rights reserved.
            </div>
            <div className="flex items-center gap-2">
              Made with ❤️ by{" "}
              <span className="font-medium text-purple-400">
                Atreya Sharma
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;