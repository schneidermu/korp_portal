import { css } from "@styled-system/css";
import { BoxProps, Center, styled } from "@styled-system/jsx";

import { SaxUserBold } from "@meysam213/iconsax-react";

import { mediaAbsoluteURL } from "@api/media/types";
import { User } from "@api/user/types";

export const Avatar = ({ user, ...rest }: BoxProps & { user?: User }) => {
  return (
    <Center bg="Corporate/Accent" borderRadius="full" {...rest}>
      {user?.photo ? (
        <styled.img
          objectFit="cover"
          borderRadius="full"
          w="full"
          h="full"
          src={user?.photo ? mediaAbsoluteURL(user.photo) : undefined}
        />
      ) : (
        <SaxUserBold
          color="white"
          className={css({ width: "full", height: "full", m: "25%" })}
        />
      )}
    </Center>
  );
};
