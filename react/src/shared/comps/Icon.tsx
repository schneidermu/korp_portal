import clsx from "clsx/lite";

export const Icon = ({
  src,
  className,
  height,
  width,
}: {
  src: string;
  className?: string;
  height?: string | number;
  width?: string | number;
}) => {
  return (
    <img
      src={src}
      style={{ height, width }}
      className={clsx(className, "select-none")}
      draggable={false}
      alt=""
    />
  );
};
