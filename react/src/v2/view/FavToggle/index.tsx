import { useState } from "react";

import { styled } from "@styled-system/jsx";

import { SaxStarBold } from "./SaxStarBold";
import { SaxStarSlashBold } from "@meysam213/iconsax-react";
import { css } from "@styled-system/css";

export type FavouriteButtonProps = Omit<
  Parameters<typeof styled.button>[0],
  "children"
> & {
  fav?: boolean;
  toggle: () => void;
};

export const FavToggle = ({
  fav = false,
  toggle,
  ...rest
}: FavouriteButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  return (
    <styled.button
      p={2.5}
      cursor="pointer"
      borderWidth="1px"
      borderRadius="full"
      borderColor={{
        base: "Grayscale/SpacerLight",
        _hover: justToggled
          ? undefined
          : fav
            ? "Corporate/Accent"
            : "Grayscale/SpacerLight",
      }}
      color={{
        base: fav ? "Corporate/Accent" : "Grayscale/Disabled",
        _hover: !justToggled ? "Corporate/Accent" : undefined,
      }}
      onClick={() => {
        toggle();
        setJustToggled(true);
      }}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setJustToggled(false);
      }}
      {...rest}
    >
      {!justToggled && hovered && fav ? (
        <SaxStarSlashBold className={css({ w: 6, h: 6 })} />
      ) : (
        <SaxStarBold className={css({ w: 6, h: 6 })} />
      )}
    </styled.button>
  );
};
