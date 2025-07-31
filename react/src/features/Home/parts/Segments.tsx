import { Grid, Heading, Icon, Link, Stack } from "@chakra-ui/react";

import {
  LuBriefcaseBusiness,
  LuFileText,
  LuMonitorCheck,
} from "react-icons/lu";

const SEGMENTS = [
  {
    name: "ПКИ",
    icon: <LuMonitorCheck />,
    bg: "blue.1",
    fg: "white",
    link: "https://www.example.com",
  },
  {
    name: "ИГУ",
    icon: <LuMonitorCheck />,
    bg: "white",
    fg: "blue.2",
    link: "https://www.example.com",
  },
  {
    name: "Моя вода",
    icon: <LuBriefcaseBusiness />,
    bg: "blue.2",
    fg: "white",
    link: "https://www.example.com",
  },
  {
    name: "Вода России",
    icon: <LuFileText />,
    bg: "white",
    fg: "blue.2",
    link: "https://www.example.com",
  },
];

export const SegmentsSection = () => {
  return (
    <Stack as="section" gap={5}>
      <Heading as="h1" fontWeight="normal" fontSize="3xl">
        Сегменты
      </Heading>
      <Grid templateColumns="1fr 1fr 1fr" gapX={5} gapY={6}>
        {SEGMENTS.map(({ name, icon, bg, fg, link }) => (
          <article>
            <Link
              href={link}
              display="flex"
              color={fg}
              bg={bg}
              px={5}
              py={3}
              borderRadius={2}
              shadow="0 0 5px 0 rgba(0, 0, 0, 0.2)"
              justifyContent="space-between"
              alignItems="start"
              _hover={{ color: fg }}
            >
              <Heading as="h1">{name}</Heading>
              <Icon w={14} h={14} strokeWidth={1}>
                {icon}
              </Icon>
            </Link>
          </article>
        ))}
      </Grid>
    </Stack>
  );
};
