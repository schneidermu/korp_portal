import { Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { NEXTCLOUD_PREFIX } from "@/app/const.ts";

import { useAuth } from "@/features/auth/slice";

export const NewNavBar = () => {
  const { orgId, userId } = useAuth();

  const links: { name: string; link: string; anchor?: boolean }[] = [
    { name: "Новости", link: "/new/feed" },
    { name: "Мой профиль", link: userId ? `/new/profile/${userId}` : "/" },
    {
      name: "Список сотрудников",
      link: orgId !== null ? `/new/list?orgId=${orgId}` : "/list",
    },
    // {
    //   name: "Список отделов",
    //   link: orgId !== null ? `/units?org=${orgId}` : "/units",
    // },
    { name: "Облако", link: "/new/nextcloud" },
    {
      name: "Облако (полный экран)",
      link: NEXTCLOUD_PREFIX + "/",
      anchor: true,
    },
  ];

  return (
    <Stack fontSize="2xl" color="blue.2" gap="9">
      {links.map((link) => (
        <Text
          key={link.link}
          asChild
          fontWeight="semibold"
          textDecoration={{ _hover: "underline" }}
        >
          {link.anchor ? (
            <a href={link.link}>{link.name}</a>
          ) : (
            <Link to={link.link}>{link.name}</Link>
          )}
        </Text>
      ))}
    </Stack>
  );
};
