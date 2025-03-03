import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { enableMapSet } from "immer";
import { Provider } from "react-redux";
import { SWRConfig } from "swr";

import { store } from "@/app/store.ts";
import { swrConfig } from "./app/swrConfig";

import { App } from "@/features/App/App";

import "./index.css";

enableMapSet();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <SWRConfig value={swrConfig}>
        <App />
      </SWRConfig>
    </Provider>
  </StrictMode>,
);
