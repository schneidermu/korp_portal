import clsx from "clsx/lite";

import { Icon } from "./Icon";

import arrow from "@/assets/arrow.png";

export const SlideButton = ({
  direction,
  hide = false,
  onClick,
}: {
  direction: "left" | "right";
  hide?: boolean;
  onClick?: () => void;
}) => {
  return (
    <div style={{ width: "83px" }}>
      {!hide && (
        <button type="button" className="py-[40px]" onClick={onClick}>
          <Icon
            src={arrow}
            height="83px"
            className={clsx(direction === "left" && "rotate-180")}
          />
        </button>
      )}
    </div>
  );
};
