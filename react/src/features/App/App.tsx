import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { ChakraProvider } from "@chakra-ui/react";

import { system } from "./theme";

import { Feed } from "@/features/Feed/Feed";
import { NotFound } from "@/features/NotFound/NotFound";
import { UserProfile } from "@/features/Profile/Profile";
import { UnitList } from "@/features/UnitList/UnitList";
import { UserList } from "@/features/UserList/UserList";

import { Page } from "./parts/Page";

export const App = () => {
  return (
    <ChakraProvider value={system}>
      <HashRouter>
        <Routes>
          <Route element={<Page />}>
            <Route path="/" element={<UserProfile />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="list/:query?" element={<UserList />} />
            <Route path="/units/:query?" element={<UnitList />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ChakraProvider>
  );
};
