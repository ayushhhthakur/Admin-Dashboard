import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard')));

// utilities routing
const UtilsUsers = Loadable(lazy(() => import('views/utilities/Users')));
const UtilsJobs = Loadable(lazy(() => import('views/utilities/Jobs')));
const UtilsInterview = Loadable(lazy(() => import('views/utilities/Interview')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// profile routing
const UserProfile = Loadable(lazy(() => import('views/utilities/UserProfile')));
const JobDesc = Loadable(lazy(() => import('views/utilities/JobDesc')));

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      element: <DashboardDefault />
    },
    {
      path: 'utils',
      children: [
        {
          path: 'users',
          element: <UtilsUsers />
        },
        {
          path: 'jobs',
          element: <UtilsJobs />
        },
        {
          path: 'interview',
          element: <UtilsInterview />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'users/:userId',
      element: <UserProfile />
    },
    {
      path: 'jobs/:jobId',
      element: <JobDesc />
    }
  ]
};

export default MainRoutes;
