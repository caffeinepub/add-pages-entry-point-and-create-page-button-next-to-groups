import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, createHashHistory } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import ProfileSetupModal from './components/ProfileSetupModal';
import Header from './components/Header';
import HorizontalNav from './components/HorizontalNav';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import EventsPage from './pages/EventsPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import PagesPage from './pages/PagesPage';
import CreatePagePage from './pages/CreatePagePage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import MessagesPage from './pages/MessagesPage';
import ExplorePage from './pages/ExplorePage';
import TopicPage from './pages/TopicPage';
import PollsPage from './pages/PollsPage';
import CreatePollPage from './pages/CreatePollPage';
import MyConstituencyPage from './pages/MyConstituencyPage';
import DiscussionsPage from './pages/DiscussionsPage';
import { isCapacitor } from './capacitor/runtime';
import { installInternetIdentityShim } from './capacitor/iiWindowOpenShim';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Layout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Install II shim for Capacitor
  useEffect(() => {
    if (isCapacitor()) {
      installInternetIdentityShim();
    }
  }, []);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[oklch(0.45_0.12_250)]"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />
      <HorizontalNav />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster position="top-center" />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const videoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/video',
  component: VideoPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: EventsPage,
});

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups',
  component: GroupsPage,
});

const groupDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups/$groupId',
  component: GroupDetailPage,
});

const pagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pages',
  component: PagesPage,
});

const createPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pages/create',
  component: CreatePagePage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$userId',
  component: UserProfilePage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: MessagesPage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/explore',
  component: ExplorePage,
});

const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/topic/$hashtag',
  component: TopicPage,
});

const pollsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/polls',
  component: PollsPage,
});

const createPollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/polls/create',
  component: CreatePollPage,
});

const myConstituencyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/myconstituency',
  component: MyConstituencyPage,
});

const discussionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discussions',
  component: DiscussionsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  videoRoute,
  eventsRoute,
  groupsRoute,
  groupDetailRoute,
  pagesRoute,
  createPageRoute,
  profileRoute,
  userProfileRoute,
  messagesRoute,
  exploreRoute,
  topicRoute,
  pollsRoute,
  createPollRoute,
  myConstituencyRoute,
  discussionsRoute,
]);

// Use hash history for Capacitor to avoid blank pages on navigation
const history = isCapacitor() ? createHashHistory() : undefined;

const router = createRouter({ 
  routeTree,
  ...(history && { history }),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
