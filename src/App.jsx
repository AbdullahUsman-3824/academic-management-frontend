<<<<<<< Updated upstream
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import AppProviders from './app/providers/AppProviders'

function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
=======
import {Box} from '@mui/material'
function App() {
  return (
    <>
    <Box>
      Hello world
    </Box>
    </>
>>>>>>> Stashed changes
  )
}
export default App
