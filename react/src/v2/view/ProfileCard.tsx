import { Transition, motion } from "motion/react";

import { css } from "@styled-system/css";
import { Box, styled } from "@styled-system/jsx";
import { grid } from "@styled-system/patterns";

import { useFetchUser } from "@api/user";
import { fullNameShort } from "../api/user/utils";
import { Avatar } from "./Avatar";
import { RRLink } from "./RRLink";

export const ProfileCard = ({
  isOpen = true,
  transition,
  fallbackName,
  subtitle,
  userId,
}: {
  isOpen?: boolean;
  transition?: Transition<unknown>;
  fallbackName?: string;
  subtitle?: string;
  userId: string | null;
}) => {
  const { data: user } = useFetchUser(userId);

  return (
    <RRLink to={userId && `/profile/${userId}`}>
      <motion.article
        initial={{
          paddingInline: isOpen ? "0.75rem" : 0,
          paddingBlock: isOpen ? "0.75rem" : "0.5rem",
        }}
        animate={{
          paddingInline: isOpen ? "0.75rem" : 0,
          paddingBlock: isOpen ? "0.75rem" : "0.5rem",
        }}
        transition={transition}
        className={grid({
          gridTemplateColumns: "auto 1fr",
          columnGap: 2,
          rowGap: 1,
          h: "3.75rem",
        })}
      >
        {(user || fallbackName) && (
          <motion.div
            initial={{
              width: isOpen ? "2.25rem" : "2.75rem",
              height: isOpen ? "2.25rem" : "2.75rem",
            }}
            animate={{
              width: isOpen ? "2.25rem" : "2.75rem",
              height: isOpen ? "2.25rem" : "2.75rem",
            }}
            transition={transition}
            className={css({ gridRow: "span 2" })}
          >
            <Avatar w="full" h="full" user={user} />
          </motion.div>
        )}
        {isOpen && (
          <>
            <styled.h1
              fontSize="Body/S"
              color="Grayscale/Black"
              textDecoration={{ _hover: "underline" }}
              lineClamp={1}
            >
              {user && userId ? fullNameShort(user) : fallbackName} &nbsp;
            </styled.h1>
            <Box fontSize="Body/XS" color="Grayscale/Border" lineClamp={1}>
              {(user || fallbackName) && (subtitle ?? (user && user.email))}{" "}
              &nbsp;
            </Box>
          </>
        )}
      </motion.article>
    </RRLink>
  );
};
