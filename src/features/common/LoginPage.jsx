import { Box, Button, TextField } from "@mui/material";
import logo from "../../assets/icons/lawcollegelogo.png";
import background from "../../assets/images/lawcollegeimage1.webp";

const LoginPage = () => {
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
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(1, 115, 72, 0.3)",
        }}
      />

      <Box
        component="form"
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

          <TextField
            label="Username"
            variant="standard"
            fullWidth
            sx={{
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#017348",
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "#017348",
              },
            }}
          />

          <TextField
            label="Password"
            type="password"
            variant="standard"
            fullWidth
            autoComplete="current-password"
            sx={{
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#017348",
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "#017348",
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 1,
              backgroundColor: "#017348",
              "&:hover": {
                backgroundColor: "#004a2e",
              },
              height: 42,
            }}
          >
            Login
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
