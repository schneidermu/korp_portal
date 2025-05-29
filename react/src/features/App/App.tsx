import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";

import { system } from "./theme";

import { UserTreePage } from "@/features/UserTree/UserTree.tsx";
import { FeedPage } from "@/features/Feed/Feed";
import { ProfilePage } from "@/features/Profile/Profile";
import { UserList } from "@/features/UserList/UserList";
import { NextcloudPage } from "@/features/Nextcloud/Nextcloud";
import { NotFound } from "@/features/NotFound/NotFound";
import { OrgPage } from "@/features/Org/Org";
import { PostNewsForm } from "@/features/NewsEditor/NewsEditor.tsx";

import { AuthLoader } from "./parts/AuthLoader";
import { ProtectedPage } from "./parts/ProtectedPage";

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
