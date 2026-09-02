import { useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../store";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { refetchUser, isLoadingUser } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    // Only call /auth/me if we don't already have the user in Redux
    if (!user) {
      refetchUser();
    }
  }, [user, refetchUser]);

  // Optional: Show a loading screen while checking authentication
  if (!user && isLoadingUser) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "18px",
        }}
      >
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;