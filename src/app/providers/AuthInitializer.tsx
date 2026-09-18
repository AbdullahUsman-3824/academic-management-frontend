import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Box } from "@mui/material";
import logo from "../../assets/icons/law-college-logo.png";
import background from "../../assets/images/lawcollegeimage1.webp";

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
    const MIN_LOADING_TIME = 1400; // 1.4 seconds = one full pulse

    const startTime = Date.now();

    Promise.resolve(refetchUser()).finally(() => {
      if (!isMounted) return;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

      setTimeout(() => {
        if (isMounted) setHasChecked(true);
      }, remaining);
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasChecked) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundImage: `url(${background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {/* Blur Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(1, 115, 72, 0.3)",
          }}
        />

        {/* Pulsing Logo */}
        <Box
          component="img"
          src={logo}
          alt="Loading..."
          sx={{
            width: 90,
            height: 90,
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
            animation: "pulse 1.4s ease-in-out infinite",
            backgroundColor: "white",
            borderRadius: "50%",
            padding: 0.5,
          }}
        />

        <style>
          {`
            @keyframes pulse {
              0%   { transform: scale(1); opacity: 0.7; }
              50%  { transform: scale(1.5); opacity: 1; }
              100% { transform: scale(1); opacity: 0.7; }
            }
          `}
        </style>
      </Box>
    );
  }

  return <>{children}</>;
};

export default AuthInitializer;
