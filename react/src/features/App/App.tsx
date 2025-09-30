import React from "react";

import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";

import { system } from "./theme";

import NotFound from "@/features/NotFound/NotFound";
import NextcloudPage from "@/features/Nextcloud/Nextcloud";

import ProtectedPage from "./parts/ProtectedPage";

import Skel from "@page/skel";

const ProfilePage = React.lazy(
  async () => import("@/features/Profile/Profile"),
);
const UserList = React.lazy(async () => import("@/features/UserList/UserList"));
const UserTreePage = React.lazy(
  async () => import("@/features/UserTree/UserTree"),
);
const FeedPage = React.lazy(async () => import("@/features/Feed/Feed"));
const PostNewsForm = React.lazy(
  async () => import("@/features/NewsEditor/NewsEditor"),
);

const TakePollPage = React.lazy(
  async () => import("@/features/Poll/take/pages/TakePollPage"),
);
const ViewPollPage = React.lazy(
  async () => import("@/features/Poll/take/pages/ViewPollPage"),
);
const CreatePollPage = React.lazy(
  async () => import("@/features/Poll/edit/pages/CreatePollPage"),
);
const EditPollPage = React.lazy(
  async () => import("@/features/Poll/edit/pages/EditPollPage"),
);
const PollsDashboardPage = React.lazy(
  async () => import("@/features/Poll/list/PollsDashboardPage.tsx"),
);
const PollStatsPage = React.lazy(
  async () => import("@/features/Poll/take/pages/PollStatsPage"),
);
const FormDashboardPage = React.lazy(
  async () => import("@/features/Poll/form/FormDashboardPage"),
);
const BusinessCardPage = React.lazy(
  async () => import("@/features/BusinessCard/BusinessCardPage"),
);
const HomePage = React.lazy(async () => import("@page/home"));
const CalendarPage = React.lazy(
  async () => import("@/features/Calendar/pages/CalendarPage"),
);

const SegmentsPage = React.lazy(async () => import("@page/segments"));

const Chakra = () => (
  <ChakraProvider value={system}>
    <Outlet />
  </ChakraProvider>
);

export const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Skel />}>
          <Route path="/" element={<HomePage />} />
          <Route path="segments" element={<SegmentsPage />} />
          <Route element={<Chakra />}>
            <Route path="/bc/:userId?" element={<BusinessCardPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/nextcloud" element={<NextcloudPage />} />
            <Route path="/tree/:orgId?" element={<UserTreePage />} />
            <Route path="/profile/:userId?" element={<ProfilePage />} />
            <Route path="forms">
              <Route path="dashboard" element={<FormDashboardPage />} />
              <Route path="fill/:pollId" element={<TakePollPage />} />
            </Route>
            <Route path="polls">
              <Route path="dashboard" element={<PollsDashboardPage />} />
              <Route path="take/:pollId" element={<TakePollPage />} />
              <Route path="view/:pollId" element={<ViewPollPage />} />
              <Route element={<ProtectedPage groups={["create-poll"]} />}>
                <Route path="stats/:pollId" element={<PollStatsPage />} />
                <Route path="edit/:pollId" element={<EditPollPage />} />
                <Route path="create" element={<CreatePollPage />} />
              </Route>
            </Route>
            <Route path="/list/:orgId?" element={<UserList />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route element={<ProtectedPage groups={["post-news"]} />}>
              <Route path="/post-news" element={<PostNewsForm />} />
            </Route>
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
};
