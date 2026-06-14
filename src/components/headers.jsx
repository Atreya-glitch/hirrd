import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "./ui/button";
import logo from "../assets/logo.png";
import { Briefcase, Heart, PlusCircle, User, LogOut, ChevronDown } from "lucide-react";
import { useUser, useClerk, SignInButton } from "@clerk/clerk-react";

const Header = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  

  const user = clerkUser ? {
    name: clerkUser.fullName || clerkUser.username || clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] || "User",
    email: clerkUser.primaryEmailAddress?.emailAddress || "",
    role: clerkUser.unsafeMetadata?.role || null,
    imageUrl: clerkUser.imageUrl || ""
  } : null;

  const handleRoleChange = async (role) => {
    if (clerkUser) {
      await clerkUser.update({
        unsafeMetadata: { role }
      });
    }
    setDropdownOpen(false);
  };

  const logout = () => signOut();



  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
       
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="hirrd logo" className="h-16 w-auto object-contain" />
        </Link>

      
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-purple-400 ${
                isActive ? "text-purple-400" : "text-muted-foreground"
              }`
            }
          >
            <Briefcase className="size-4" />
            Find Jobs
          </NavLink>

          <NavLink
            to="/saved-jobs"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-purple-400 ${
                isActive ? "text-purple-400" : "text-muted-foreground"
              }`
            }
          >
            <Heart className="size-4" />
            Saved Jobs
          </NavLink>

          {user?.role === "recruiter" && (
            <NavLink
              to="/post-job"
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-purple-400 ${
                  isActive ? "text-purple-400" : "text-muted-foreground"
                }`
              }
            >
              <PlusCircle className="size-4" />
              Post a Job
            </NavLink>
          )}

          <NavLink
            to="/my-jobs"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-purple-400 ${
                isActive ? "text-purple-400" : "text-muted-foreground"
              }`
            }
          >
            <User className="size-4" />
            My Jobs
          </NavLink>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {!isLoaded ? (
            <div className="size-9 rounded-full bg-white/10 animate-pulse" />
          ) : user ? (
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 border-white/10 bg-white/5 hover:bg-white/10"
              >
                <div className="size-6 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-tr from-purple-500 to-indigo-500 text-xs font-bold text-white uppercase">
                  {user.imageUrl ? (
                    <img src={user.imageUrl} alt={user.name} className="size-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-medium">
                  {user.name} ({user.role === "recruiter" ? "Recruiter" : user.role === "candidate" ? "Candidate" : "New"})
                </span>
                <ChevronDown className="size-3.5 opacity-60" />
              </Button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#16171d] p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-white/5 mb-1">
                    Switch Test Account
                  </div>
                  <button
                    onClick={() => handleRoleChange("candidate")}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                      user.role === "candidate" ? "text-purple-400 font-medium" : "text-foreground"
                    }`}
                  >
                    <User className="size-4" />
                    Candidate Mode
                  </button>
                  <button
                    onClick={() => handleRoleChange("recruiter")}
                    className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white/5 ${
                      user.role === "recruiter" ? "text-purple-400 font-medium" : "text-foreground"
                    }`}
                  >
                    <PlusCircle className="size-4" />
                    Recruiter Mode
                  </button>
                  <div className="border-t border-white/5 my-1" />
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <SignInButton mode="modal">
              <Button
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                 Sign In
              </Button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;