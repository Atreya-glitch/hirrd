import { useUser, RedirectToSignIn } from "@clerk/clerk-react";
import { useLocation, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const { pathname } = useLocation();

  if (!isLoaded) {
    return <div>Loading...</div>; 
  }

  if (isLoaded && !isSignedIn) {
    return <RedirectToSignIn />;
  }

  if (!user) {
    return null; 
  }

  return <Outlet />;
};