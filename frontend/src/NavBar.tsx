import { ReactNode } from "react";

export default function NavBar({ children }: { children: ReactNode }) {
  return (
    <nav className="flex justify-around items-center h-[76px] bg-blue rounded text-[2rem] text-white">
      {children}
    </nav>
  );
}
