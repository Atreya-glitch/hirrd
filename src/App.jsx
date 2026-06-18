import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import AppLayout from './layouts/app-layout'
import LandingPage from './pages/landing'
import SavedJobs from './pages/save-jobs'
import PostJob from './pages/post-job'
import MyJobs from './pages/my-jobs'
import JobsListing from './pages/jobs-listing'
import JobPage from './pages/jobs'
import Onboarding from './pages/onboarding'
import LiveJobs from './pages/live-jobs'
import { ThemeProvider } from './components/ui/theme-provider'
import { ProtectedRoute } from './components/ui/protected-route'
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
      {
        path: '/onboarding',
        element: <Onboarding />,
      },
      {
        path: '/jobs',
        element: <JobsListing />,
      },
      {
        path: '/jobs/:id',
        element: <JobPage />,
      },
      {
        path: '/live-jobs',
        element: <LiveJobs />,
      },
      {
        path: '/saved-jobs',
        element: <SavedJobs />,
      },
      {
        path: '/post-job',
        element: <PostJob />,
      },
      {
        path: '/my-jobs',
        element: <MyJobs />,
      },
    ],
  },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
  <RouterProvider router={router} />
</ThemeProvider>
  );
}

export default App

