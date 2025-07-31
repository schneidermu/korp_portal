import { HStack, Icon, Show, Stack, StackProps, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";

import { NEXTCLOUD_PREFIX } from "@/app/const";

import { useAuth } from "@/features/auth/slice";
import { LuChevronsRight } from "react-icons/lu";
import { ReactNode } from "react";

export const NavBar = (props: StackProps) => {
  const { orgId, userId } = useAuth();

  const links: {
    name: ReactNode;
    link: string;
    anchor?: boolean;
    icon?: ReactNode;
  }[] = [
    { name: "Главная", link: "/home" },
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
    { name: "Заявки", link: "/forms/dashboard" },
    { name: "Облако", link: "/nextcloud" },
    {
      name: (
        <>
          Облако
          <br />
          (полный экран)
        </>
      ),
      icon: <LuChevronsRight />,
      link: NEXTCLOUD_PREFIX + "/",
      anchor: true,
    },
  ];

  return (
    <Stack color="blue.2" gap="9" userSelect="none" {...props}>
      {links.map((link) => (
        <HStack gap={1}>
          <Show when={link.icon}>
            <Icon w={9} h={9}>
              {link.icon}
            </Icon>
          </Show>
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
        </HStack>
      ))}
    </Stack>
  );
};
