import { createContext } from "react";

interface Data {
  isOpen: boolean;
  isAnimating: boolean;
  duration: number;
}

const contextDefault: Data = {
  isOpen: true,
  isAnimating: false,
  duration: 0.3,
};

export const DrawerContext = createContext(contextDefault);
