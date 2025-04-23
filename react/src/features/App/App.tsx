import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";

import { system } from "./theme";

import { Feed } from "@/features/Feed/Feed";
import { NewFeedPage } from "@/features/NewFeed/NewFeed";
import { NewProfilePage } from "@/features/NewProfile/NewProfile";
import { NewUserList } from "@/features/NewUserList/NewUserList";
import { NextcloudPage } from "@/features/Nextcloud/Nextcloud";
import { NotFound } from "@/features/NotFound/NotFound";
import { OrgPage } from "@/features/Org/Org";
import { UserProfile } from "@/features/Profile/Profile";
import { UnitList } from "@/features/UnitList/UnitList";
import { UserList } from "@/features/UserList/UserList";

import { AuthLoader } from "./parts/AuthLoader";
import { Page } from "./parts/Page";

export const App = () => {
  return (
    <ChakraProvider value={system}>
      <HashRouter>
        <Routes>
          <Route element={<AuthLoader />}>
            <Route path="/nextcloud" element={<NextcloudPage />} />
            <Route path="/new/profile/:userId?" element={<NewProfilePage />} />
            <Route path="/new/org/:orgId?" element={<OrgPage />} />
            <Route path="/new/list" element={<NewUserList />} />
            <Route path="/new/feed" element={<NewFeedPage />} />
            <Route element={<Page />}>
              <Route path="/" element={<UserProfile />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="list/:query?" element={<UserList />} />
              <Route path="/units/:query?" element={<UnitList />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </ChakraProvider>
  );
};
