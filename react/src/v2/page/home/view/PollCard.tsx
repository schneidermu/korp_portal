import { Link } from "react-router-dom";

import { css } from "@styled-system/css";
import { Box, Center, styled } from "@styled-system/jsx";
import { stack } from "@styled-system/patterns";

import { Poll } from "@/features/Poll/types";

import { SaxMessageQuestionBold } from "@meysam213/iconsax-react";

import { useFetchUser } from "@api/user";
import { fullNameShort } from "@api/user/utils";
import { formatDate, parseAPIDate } from "@util/date";

const Cover = () => {
  return (
    <Center
      aspectRatio="16 / 9"
      bg="Corporate/Accent"
      minW="0"
      borderRadius="8px" /*FIXME*/
    >
      <SaxMessageQuestionBold className={css({ w: 12, h: 12 })} color="white" />
    </Center>
  );
};

export const PollCard = ({ poll }: { poll: Poll }) => {
  const { data: user } = useFetchUser(poll.author);

  const link = `/polls/take/${poll.id}/`;

  return (
    <styled.article
      className={stack({ gap: 3 })}
      p={5}
      minW={0}
      borderWidth="1px"
      borderColor="Grayscale/SpacerLight"
      transition="all 0.3s"
      shadow={{ base: "S", _hover: "L" }}
      borderRadius="12px" /*FIXME*/
    >
      <Link to={link}>
        <Cover />
      </Link>
      <Link to={link}>
        <styled.h1
          fontSize="Headline/H4"
          fontWeight="semibold"
          lineClamp="2"
          h="2.4em"
        >
          {poll.name}
        </styled.h1>
      </Link>
      <Box>
        <Box fontSize="Body/S">{user && fullNameShort(user)}</Box>
        <Box fontSize="Body/XS" color="Grayscale/Border">
          {poll.publishedAt &&
            formatDate(parseAPIDate(poll.publishedAt), {
              month: "short",
              weekday: "short",
            })}
        </Box>
      </Box>
    </styled.article>
  );
};
