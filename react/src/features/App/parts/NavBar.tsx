import { Stack, StackProps, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import { NEXTCLOUD_PREFIX } from "@/app/const";

import { useAuth } from "@/features/auth/slice";

export const NavBar = (props: StackProps) => {
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
    { name: "Опросы", link: "/polls/dashboard" },
    { name: "Облако", link: "/nextcloud" },
    {
      name: "Облако (полный экран)",
      link: NEXTCLOUD_PREFIX + "/",
      anchor: true,
    },
  ];

  return (
    <Stack color="blue.2" gap="9" userSelect="none" {...props}>
      {links.map((link) => (
        <Text
          key={link.link}
          color="inherit"
          asChild
          fontWeight="semibold"
          textDecoration={{ _hover: "underline" }}
        >
          {link.anchor ? (
            <a href={link.link} target="_blank">
              {link.name}
            </a>
          ) : (
            <NavLink to={link.link}>{link.name}</NavLink>
          )}
        </Text>
      ))}
    </Stack>
  );
};
