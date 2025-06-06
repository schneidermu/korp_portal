import { Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { NEXTCLOUD_PREFIX } from "@/app/const";

import { useAuth } from "@/features/auth/slice";

export const NavBar = () => {
  const { orgId, userId } = useAuth();

  const links: { name: string; link: string; anchor?: boolean }[] = [
    { name: "Наша жизнь", link: "/feed" },
    { name: "Мой профиль", link: userId ? `/profile/${userId}` : "/" },
    {
      name: "Список сотрудников",
      link: orgId !== null ? `/list/${orgId}` : "/list",
    },
    {
      name: "Орг. структура",
      link: orgId !== null ? `/tree/${orgId}` : "/tree",
    },
    { name: "Облако", link: "/nextcloud" },
    {
      name: "Облако (полный экран)",
      link: NEXTCLOUD_PREFIX + "/",
      anchor: true,
    },
  ];

  return (
    <Stack fontSize="2xl" color="blue.2" gap="9" userSelect="none">
      {links.map((link) => (
        <Text
          color="inherit"
          key={link.link}
          asChild
          fontWeight="semibold"
          textDecoration={{ _hover: "underline" }}
        >
          {link.anchor ? (
            <a href={link.link} target="_blank">{link.name}</a>
          ) : (
            <Link to={link.link}>{link.name}</Link>
          )}
        </Text>
      ))}
    </Stack>
  );
};
