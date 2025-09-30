import { SVGProps } from "react";

export const CircProgress = ({
  rotation = 0,
  thickness,
  progress,
  bgColor,
  ...rest
}: {
  rotation?: number;
  thickness: number;
  progress: number;
  bgColor: string;
} & SVGProps<SVGSVGElement>) => {
  const r = 100;
  const b = thickness * r;

  return (
    <svg
      viewBox={`${-r - b / 2} ${-r - b / 2} ${2 * r + b} ${2 * r + b}`}
      style={{ transform: `rotate(${rotation - 0.25}turn)` }}
      {...rest}
    >
      <circle
        r={r}
        cx="0"
        cy="0"
        fill="transparent"
        stroke={bgColor}
        strokeWidth={b}
      ></circle>
      <circle
        r={r}
        cx="0"
        cy="0"
        fill="transparent"
        stroke="currentcolor"
        strokeWidth={b}
        strokeLinecap="round"
        strokeDasharray={2 * Math.PI * r}
        strokeDashoffset={2 * Math.PI * r * (1 - progress)}
      ></circle>
    </svg>
  );
};
