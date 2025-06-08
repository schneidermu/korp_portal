import React from "react";

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";

import { system } from "./theme";

import NotFound from "@/features/NotFound/NotFound";
import NextcloudPage from "@/features/Nextcloud/Nextcloud";

import AuthLoader from "./parts/AuthLoader";
import ProtectedPage from "./parts/ProtectedPage";

const ProfilePage = React.lazy(
  async () => import("@/features/Profile/Profile"),
);
const UserList = React.lazy(async () => import("@/features/UserList/UserList"));
const UserTreePage = React.lazy(
  async () => import("@/features/UserTree/UserTree"),
);
const FeedPage = React.lazy(async () => import("@/features/Feed/Feed"));
const OrgPage = React.lazy(async () => import("@/features/Org/Org"));
const PostNewsForm = React.lazy(
  async () => import("@/features/NewsEditor/NewsEditor"),
);

export const App = () => {
  return (
    <ChakraProvider value={system}>
      <HashRouter>
        <Routes>
          <Route element={<AuthLoader />}>
            <Route path="/nextcloud" element={<NextcloudPage />} />
            <Route path="/tree/:orgId?" element={<UserTreePage />} />
            <Route path="/" element={<ProfilePage />} />
            <Route path="/profile/:userId?" element={<ProfilePage />} />
            <Route path="/new/org/:orgId?" element={<OrgPage />} />
            <Route path="/list/:orgId?" element={<UserList />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route element={<ProtectedPage groups={["post-news"]} />}>
              <Route path="/post-news" element={<PostNewsForm />} />
            </Route>
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ChakraProvider>
  );
};
