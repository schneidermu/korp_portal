import clsx from "clsx";
import arrow from "/arrow.png";

const SlideButton = ({
  direction,
  hide = false,
  onClick,
}: {
  direction: "left" | "right";
  hide?: boolean;
  onClick: () => void;
}) => {
  return (
    <div style={{ width: "83px" }}>
      {!hide && (
        <button type="button" className="py-[40px]" onClick={onClick}>
          <img
            style={{ height: "83px" }}
            className={clsx(direction === "left" && "rotate-180")}
            src={arrow}
          />
        </button>
      )}
    </div>
  );
};

export default SlideButton;
