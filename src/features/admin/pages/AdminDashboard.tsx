import { Box, Typography, Button } from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#f5f5f5",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", color: "#017348" }}>
        Admin Dashboard
      </Typography>

      <Typography variant="h6">
        Welcome, <strong>{user?.username}</strong>
      </Typography>

      <Typography variant="body1">
        Portal: <strong>{user?.portal}</strong>
      </Typography>

      <Typography variant="body2" color="text.secondary">
        User ID: {user?.id}
      </Typography>

      <Button
        variant="contained"
        color="error"
        onClick={handleLogout}
        sx={{ mt: 2 }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default AdminDashboard;