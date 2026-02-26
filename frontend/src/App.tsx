import React, { useEffect } from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ProfileSetupModal from './components/ProfileSetupModal';
import { ViewProvider } from './context/ViewContext';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';

// Pages
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import DiscussionsPage from './pages/DiscussionsPage';
import PollsPage from './pages/PollsPage';
import CreatePollPage from './pages/CreatePollPage';
import MessagesPage from './pages/MessagesPage';
import MyAreaPage from './pages/MyAreaPage';
import MyConstituencyPage from './pages/MyConstituencyPage';
import GroupDetailPage from './pages/GroupDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import TopicPage from './pages/TopicPage';
import ExplorePage from './pages/ExplorePage';
import EventsPage from './pages/EventsPage';
import EducationPage from './pages/EducationPage';
import WalletPage from './pages/WalletPage';
import WalletPointsPage from './pages/WalletPointsPage';
import VideoReelsPage from './pages/VideoReelsPage';
import SharePage from './pages/SharePage';
import CommunitiesPage from './pages/CommunitiesPage';
import CreateGroupPage from './pages/CreateGroupPage';
import CreatePagePage from './pages/CreatePagePage';
import PageDetailPage from './pages/PageDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

// ─── Layout ───────────────────────────────────────────────────────────────────

function AppLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <main className="pt-14 pb-24">
        <Outlet />
      </main>
      <BottomNav />
      {showProfileSetup && <ProfileSetupModal />}
    </div>
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({ component: AppLayout });

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: ProfilePage });
const discussionsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/discussions', component: DiscussionsPage });
const pollsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/polls', component: PollsPage });
const createPollRoute = createRoute({ getParentRoute: () => rootRoute, path: '/create-poll', component: CreatePollPage });
const messagesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/messages', component: MessagesPage });
const myAreaRoute = createRoute({ getParentRoute: () => rootRoute, path: '/my-area', component: MyAreaPage });
const myConstituencyRoute = createRoute({ getParentRoute: () => rootRoute, path: '/my-constituency', component: MyConstituencyPage });
const exploreRoute = createRoute({ getParentRoute: () => rootRoute, path: '/explore', component: ExplorePage });
const eventsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/events', component: EventsPage });
const educationRoute = createRoute({ getParentRoute: () => rootRoute, path: '/education', component: EducationPage });
const walletRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallet', component: WalletPage });
const walletPointsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/wallet-points', component: WalletPointsPage });
const reelsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/reels', component: VideoReelsPage });
const shareRoute = createRoute({ getParentRoute: () => rootRoute, path: '/share', component: SharePage });

// Communities routes
const communitiesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/communities', component: CommunitiesPage });
const createGroupRoute = createRoute({ getParentRoute: () => rootRoute, path: '/create-group', component: CreateGroupPage });
const createPageRoute = createRoute({ getParentRoute: () => rootRoute, path: '/create-page', component: CreatePagePage });

// Group detail
const groupDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups/$groupId',
  component: GroupDetailPage,
});

// Page detail
const pageDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pages/$pageId',
  component: PageDetailPage,
});

// User profile
const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user/$userId',
  component: UserProfilePage,
});

// Topic
const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/topic/$topic',
  component: TopicPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  discussionsRoute,
  pollsRoute,
  createPollRoute,
  messagesRoute,
  myAreaRoute,
  myConstituencyRoute,
  exploreRoute,
  eventsRoute,
  educationRoute,
  walletRoute,
  walletPointsRoute,
  reelsRoute,
  shareRoute,
  communitiesRoute,
  createGroupRoute,
  createPageRoute,
  groupDetailRoute,
  pageDetailRoute,
  userProfileRoute,
  topicRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ViewProvider>
          <RouterProvider router={router} />
          <Toaster richColors position="top-center" />
        </ViewProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
