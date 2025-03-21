import React, { SVGProps } from "react";

export const LuPlus = React.forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  function LuPlus(props, ref) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        ref={ref}
        {...props}
      >
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 12h14m-7-7v14"
        ></path>
      </svg>
    );
  },
);
