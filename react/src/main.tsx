import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { enableMapSet } from "immer";
import { Provider } from "react-redux";
import { SWRConfig } from "swr";

import { store } from "@/app/store";
import { swrConfig } from "./app/swrConfig";

import { App } from "@app/index";

import "./index.css";

import "@styled-system/styles.css";
import "@app/index.css";

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
