import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { SWRConfig } from "swr";

import { store } from "./store";

import App from "./App.tsx";
import "./index.css";
import { enableMapSet } from "immer";

const swrConfig = {
  keepPreviousData: true,
};

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
