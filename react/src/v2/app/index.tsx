import { HashRouter, Route, Routes } from "react-router-dom";

import { ChakraWrapper } from "@/features/App/comps/ChakraWrapper";

import { ROUTES } from "@app/routes";
import Skel from "@page/skel";
import { ProtectedRoute } from "@view/ProtectedRoute";

export const App = () => {
  const newRoutes = Object.values(ROUTES).filter((r) => !r.chakra);
  const oldRoutes = Object.values(ROUTES).filter((r) => r.chakra);

  return (
    <HashRouter>
      <Routes>
        <Route element={<Skel />}>
          {newRoutes.map((r) => (
            <Route element={<ProtectedRoute groups={r.groups} />}>
              <Route path={r.path} element={<r.element />} />
            </Route>
          ))}
          <Route element={<ChakraWrapper />}>
            {oldRoutes.map((r) => (
              <Route element={<ProtectedRoute groups={r.groups} />}>
                <Route path={r.path} element={<r.element />} />
              </Route>
            ))}
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
};
