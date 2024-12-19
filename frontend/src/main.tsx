import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { SWRConfig } from "swr";
import { HashRouter, Routes, Route } from "react-router-dom";

import { store } from "./store";

import { enableMapSet } from "immer";
import "./index.css";

import { UserList } from "./UserList.tsx";
import { UserProfile } from "./UserProfile.tsx";
import { Page } from "./Page.tsx";
import Feed from "./Feed.tsx";

const swrConfig = {
  keepPreviousData: true,
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
            </Route>
          </Routes>
        </HashRouter>
      </SWRConfig>
    </Provider>
  </StrictMode>,
);
