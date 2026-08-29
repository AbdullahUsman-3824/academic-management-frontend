import { Box } from "@mui/material";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import AppProviders from "./app/providers/AppProviders";

function App() {
  return (
    <AppProviders>
      <Box>
        <RouterProvider router={router} />
      </Box>
    </AppProviders>
  );
}

export default App;
