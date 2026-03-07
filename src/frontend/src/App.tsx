import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import React from "react";
import { ViewProvider } from "./context/ViewContext";

import BottomNav from "./components/BottomNav";
import Header from "./components/Header";

import AdminPage from "./pages/AdminPage";
import CommunitiesPage from "./pages/CommunitiesPage";
import CreateGroupPage from "./pages/CreateGroupPage";
import CreatePagePage from "./pages/CreatePagePage";
import CreatePollPage from "./pages/CreatePollPage";
import DiscussionsPage from "./pages/DiscussionsPage";
import EducationPage from "./pages/EducationPage";
import EventsPage from "./pages/EventsPage";
import ExplorePage from "./pages/ExplorePage";
import GroupDetailPage from "./pages/GroupDetailPage";
import HomePage from "./pages/HomePage";
import MessagesPage from "./pages/MessagesPage";
import MyAreaPage from "./pages/MyAreaPage";
import MyConstituencyPage from "./pages/MyConstituencyPage";
import PageDetailPage from "./pages/PageDetailPage";
import PollResultsPage from "./pages/PollResultsPage";
import PollsPage from "./pages/PollsPage";
import ProfilePage from "./pages/ProfilePage";
import TopicPage from "./pages/TopicPage";
import UserProfilePage from "./pages/UserProfilePage";
import VideoReelsPage from "./pages/VideoReelsPage";
import WalletPage from "./pages/WalletPage";
import WalletPointsPage from "./pages/WalletPointsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-16">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const pollsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/polls",
  component: PollsPage,
});

const pollResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/poll-results",
  component: PollResultsPage,
});

const createPollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-poll",
  component: CreatePollPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const communitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/communities",
  component: CommunitiesPage,
});

const groupDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/groups/$groupId",
  component: GroupDetailPage,
});

const pageDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pages/$pageId",
  component: PageDetailPage,
});

const createGroupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-group",
  component: CreateGroupPage,
});

const createPageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create-page",
  component: CreatePagePage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/messages",
  component: MessagesPage,
});

const videoReelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reels",
  component: VideoReelsPage,
});

const discussionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discussions",
  component: DiscussionsPage,
});

const myAreaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-area",
  component: MyAreaPage,
});

const myConstituencyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-constituency",
  component: MyConstituencyPage,
});

const topicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/topic/$topic",
  component: TopicPage,
});

const exploreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: ExplorePage,
});

const walletRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet",
  component: WalletPage,
});

const walletPointsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/wallet-points",
  component: WalletPointsPage,
});

const userProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user/$principalId",
  component: UserProfilePage,
});

const educationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/education",
  component: EducationPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/events",
  component: EventsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  pollsRoute,
  pollResultsRoute,
  createPollRoute,
  profileRoute,
  communitiesRoute,
  groupDetailRoute,
  pageDetailRoute,
  createGroupRoute,
  createPageRoute,
  messagesRoute,
  videoReelsRoute,
  discussionsRoute,
  myAreaRoute,
  myConstituencyRoute,
  topicRoute,
  exploreRoute,
  walletRoute,
  walletPointsRoute,
  userProfileRoute,
  educationRoute,
  eventsRoute,
  adminRoute,
]);

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8">
      <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
      <p className="text-muted-foreground text-center">
        The page you're looking for doesn't exist.
      </p>
      <a href="/" className="text-primary underline">
        Go Home
      </a>
    </div>
  ),
});

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <ViewProvider>
          <RouterProvider router={router} />
          <Toaster position="top-center" richColors />
        </ViewProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
