import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";

import { Feed } from "@/features/Feed/Feed";
import { NewProfile } from "@/features/NewProfile/NewProfile";
import { NotFound } from "@/features/NotFound/NotFound";
import { UserProfile } from "@/features/Profile/Profile";
import { UnitList } from "@/features/UnitList/UnitList";
import { UserList } from "@/features/UserList/UserList";

import { AuthLoader } from "./parts/AuthLoader";
import { Page } from "./parts/Page";

import { defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  strictTokens: true,
  theme: {
    tokens: {
      colors: {
        gray: {
          1: { value: "#C4C4C4" },
          2: { value: "#656565" },
          3: { value: "#8C8C8C" },
        },
        blue: {
          1: { value: "#2F80ED" },
        },
      },
      spacing: {
        DEFAULT: { value: "0" },
      },
      radii: {
        1: { value: "8px" },
        2: { value: "10px" },
      },
      fontSizes: {
        smaller: { value: "0.9375rem" }, // 15px
        larger: { value: "1.0625rem" }, // 17px
      },
    },
  },
});

const system = createSystem(defaultConfig, customConfig);

export const App = () => {
  return (
    <ChakraProvider value={system}>
      <HashRouter>
        <Routes>
          <Route element={<AuthLoader />}>
            <Route path="/new" element={<NewProfile />} />
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
