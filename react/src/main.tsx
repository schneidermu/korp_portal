import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { enableMapSet } from "immer";
import { Provider } from "react-redux";
import { HashRouter, Route, Routes } from "react-router-dom";
import { SWRConfig, SWRConfiguration } from "swr";

import { store } from "@/app/store.ts";

import { Page } from "@/app/Page.tsx";
import { Feed } from "@/feed/Feed.tsx";
import { UnitList } from "@/user/UnitList";
import { UserList } from "@/user/UserList.tsx";
import { UserProfile } from "@/user/UserProfile.tsx";

import "./index.css";

const swrConfig: SWRConfiguration = {
  keepPreviousData: true,
  revalidateOnFocus: false,
  revalidateIfStale: false,
};

enableMapSet();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <SWRConfig value={swrConfig}>
        <HashRouter>
          <Routes>
            <Route element={<Page />}>
              <Route path="/" element={<UserProfile />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="list/:query?" element={<UserList />} />
              <Route path="/units/:query?" element={<UnitList />} />
            </Route>
          </Routes>
        </HashRouter>
      </SWRConfig>
    </Provider>
  </StrictMode>,
);
