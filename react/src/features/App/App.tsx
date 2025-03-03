import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { ChakraProvider, createSystem, defineConfig } from "@chakra-ui/react";

import { Feed } from "@/features/Feed/Feed";
import { NotFound } from "@/features/NotFound/NotFound";
import { UserProfile } from "@/features/Profile/Profile";
import { UnitList } from "@/features/UnitList/UnitList";
import { UserList } from "@/features/UserList/UserList";

import { Page } from "./parts/Page";

const config = defineConfig({
  strictTokens: true,
  theme: {
    tokens: {
      colors: {},
    },
  },
});

const system = createSystem(config);

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
