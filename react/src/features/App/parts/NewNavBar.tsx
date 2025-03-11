import { Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import { useAuth } from "@/features/auth/slice";

export const NewNavBar = () => {
  const { orgId, userId } = useAuth();

  const links = [
    ["Рабочий стол", orgId !== null ? `/feed?org=${orgId}` : "/feed"],
    ["Мой профиль", userId ? `/profile/${userId}` : "/"],
    ["Список сотрудников", orgId !== null ? `/list?org=${orgId}` : "/list"],
    ["Список отделов", orgId !== null ? `/units?org=${orgId}` : "/units"],
  ] as const;

  return (
    <Stack fontSize="2xl" color="blue.2" gap="9">
      {links.map(([text, url]) => (
        <Text
          key={text}
          asChild
          fontWeight="semibold"
          textDecoration={{ _hover: "underline" }}
        >
          <Link to={url}>{text}</Link>
        </Text>
      ))}
    </Stack>
  );
};
