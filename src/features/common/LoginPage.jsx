import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/icons/law-college-logo.png";
import background from "../../assets/images/lawcollegeimage1.webp";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    login(
      { username, password },
      {
        onSuccess: () => {
          navigate("/");
        },
      },
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
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

      {/* Login Card */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          height: 420,
          width: 370,
          backgroundColor: "background.paper",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: "0px 0px 10px #017348",
          borderRadius: "10px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2.5,
            width: 280,
          }}
        >
          {/* Logo */}
          <Box
            component="img"
            src={logo}
            alt="College Logo"
            sx={{
              width: 90,
              height: 90,
              objectFit: "contain",
              mb: 1,
            }}
          />

          {/* Username */}
          <TextField
            label="Username"
            variant="standard"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            sx={{
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#017348",
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "#017348",
              },
            }}
          />

          {/* Password */}
          <TextField
            label="Password"
            type="password"
            variant="standard"
            fullWidth
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#017348",
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "#017348",
              },
            }}
          />

          {/* Error Message */}
          {loginError && (
            <Typography color="error" variant="body2" sx={{ mt: -1 }}>
              Invalid username or password
            </Typography>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoggingIn}
            sx={{
              mt: 1,
              backgroundColor: "#017348",
              "&:hover": {
                backgroundColor: "#004a2e",
              },
              height: 42,
            }}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
