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

import { AuthLoader } from "./parts/AuthLoader";

export const App = () => {
  return (
    <ChakraProvider value={system}>
      <HashRouter>
        <Routes>
          <Route element={<AuthLoader />}>
            <Route path="/nextcloud" element={<NextcloudPage />} />
            <Route path="/new/profile/:userId?" element={<NewProfilePage />} />
            <Route path="/nextcloud" element={<NextcloudPage />} />
            <Route path="/" element={<NewProfilePage />} />
            <Route path="/profile/:userId?" element={<NewProfilePage />} />
            <Route path="/new/org/:orgId?" element={<OrgPage />} />
            <Route path="/list" element={<NewUserList />} />
            <Route path="/feed" element={<NewFeedPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ChakraProvider>
  );
};
