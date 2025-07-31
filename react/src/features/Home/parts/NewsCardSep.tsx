import { SVGProps } from "react";

export const NewsCardSep = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="182"
    height="23"
    {...props}
  >
    <line y1="10.5" x2="72" y2="10.5" />
    <line x1="110" y1="10.5" x2="182" y2="10.5" />
    <line x1="90.5" x2="90.5" y2="23" />
  </svg>
);
