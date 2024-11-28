import { useDispatch } from "react-redux";
import { pageSlice } from "./page/slice";

import backArrowIcon from "/back-arrow.svg";
import clsx from "clsx";
import { useState } from "react";

const DropdownArrow = () => {
  return (
    <object
      type="image/svg+xml"
      className="-rotate-90 w-[1em] h-[1em] ml-[0.1em] mt-[0.1em]"
      data={backArrowIcon}
    ></object>
  );
};

const DropdownMenu = ({ position }: { position?: "left" | "right" }) => {
  const dispatch = useDispatch();
  const [shown, setShown] = useState(false);

  return (
    <div onMouseLeave={() => setShown(false)} className="relative h-full">
      <div
        className={clsx(
          "relative z-20",
          "h-full pl-[60px] pr-[110px]",
          "bg-blue",
          position === "left" && "rounded-l",
          position === "right" && "rounded-r",
          "flex justify-center items-center",
        )}
      >
        <div
          className="flex items-center p-[10px] cursor-default"
          onMouseEnter={() => setShown(true)}
        >
          <span>Орг. структура</span>
          <DropdownArrow />
        </div>
      </div>
      <div
        className={clsx(
          "absolute top-[calc(100%-10px)] pt-[10px] right-0 z-10 pl-[70px]",
          "text-nav-link bg-white w-full",
          "rounded-b border border-black border-opacity-50",
          shown || "hidden",
        )}
      >
        <div className="flex flex-col gap-[35px] mt-[25px] mb-[40px]">
          <a className="hover:underline cursor-pointer" onClick={() => {}}>
            Орг. структура
          </a>
          <a
            className="hover:underline cursor-pointer"
            onClick={() => {
              dispatch(pageSlice.actions.viewOrgStruct({ unitId: null }));
              setShown(false);
            }}
          >
            Список сотрудников
          </a>
          <a className="hover:underline cursor-pointer" onClick={() => {}}>
            Список отделов
          </a>
        </div>
      </div>
    </div>
  );
};

export default function NavBar() {
  const dispatch = useDispatch();

  return (
    <nav className="flex justify-between items-center h-[76px] bg-blue rounded text-[32px] text-white">
      <button
        className="hover:underline mx-[120px]"
        onClick={() => {
          dispatch(pageSlice.actions.viewFeed());
        }}
      >
        Рабочий стол
      </button>
      <button
        className="hover:underline mx-[120px]"
        onClick={() => {
          dispatch(pageSlice.actions.viewProfile({ userId: null }));
        }}
      >
        Мой профиль
      </button>
      <DropdownMenu position="right" />
    </nav>
  );
}
