import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../store";

interface AuthInitializerProps {
  children: React.ReactNode;
}

const AuthInitializer = ({ children }: AuthInitializerProps) => {
  const { refetchUser } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (user) {
      setHasChecked(true);
      return;
    }

    let isMounted = true;

    Promise.resolve(refetchUser()).finally(() => {
      if (isMounted) setHasChecked(true);
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // sirf mount py ek dafa chalayen

  if (!hasChecked) {
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
